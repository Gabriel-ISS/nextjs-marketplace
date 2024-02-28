'use client'

import { CustomFormikError } from '@/_Components/Inputs';
import MessageModal from '@/_Components/Modal/MessageModal';
import { createUser } from '@/_lib/actions';
import { revalidatePath } from '@/_lib/data';
import { NewCredentialsSchema, userSchema } from '@/_lib/validation-schemas';
import useAppStore from '@/_store/useStore';
import styles from '@/auth/page.module.scss';
import { TEST_ADMIN } from '@/constants';
import { Field, Form, Formik } from 'formik';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEventHandler, FocusEventHandler, HTMLAttributes, HTMLInputTypeAttribute, useEffect, useState } from 'react';
import { FaRegCopy } from 'react-icons/fa';
import { TbLoader2 } from 'react-icons/tb';
import { ArrowContainer, Popover } from 'react-tiny-popover';


type UserCredentials = Pick<User, 'name' | 'password'>
export default function Auth() {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const openModal = useAppStore(s => s.modal.open)
  const callbackUrl = searchParams.get('callbackUrl') as string
  const newAccount = searchParams.get('new-account')

  const handleSubmit = async (credentials: UserCredentials) => {
    let res;
    if (newAccount) {
      res = await createUser(credentials)
    }
    
    res = await signIn('credentials', {
      ...credentials,
      redirect: callbackUrl == '/cart'
    })

    if (res?.error) {
      openModal(<MessageModal title='Error' message={res.error} />, 'red')
    } else {
      await revalidatePath('/cart')
      push(callbackUrl)
    }
  }

  return (
    <main className={styles.main}>
      <FakeCredentials />
      <div className={styles.container}>
        <Formik<UserCredentials>
          initialValues={{ name: '', password: '' }}
          validationSchema={newAccount ? NewCredentialsSchema : userSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, values }) => (
            <Form>
              <Field className={styles.input} name='name' component={Input} label='Nombre' type='text' />
              <Field className={styles.input} name='password' component={Input} label='Contraseña' type='password' />
              {newAccount && <Field className={styles.input} name='confirmPassword' component={Input} label='Confirmar contraseña' type='password' />}
              <button className={styles.login_btn} type='submit'>{isSubmitting ? <>Verificando <TbLoader2 className={styles.loader} /></> : 'Ingresar'}</button>
            </Form>
          )}
        </Formik>
        {newAccount ? (
          <Link href='/auth'>¿Ya tienes una cuenta? Inicia sesión</Link>
        ) : (
          <Link href={`/auth?new-account=true&callbackUrl=${encodeURIComponent(callbackUrl)}`}>¿No tienes una cuenta? Regístrate</Link>
        )}
      </div>
    </main>
  )
}

interface Props extends HTMLAttributes<HTMLInputElement> {
  field: {
    name: string
    onChange: ChangeEventHandler
    onBlur: FocusEventHandler
    value: any
  }
  name: keyof UserCredentials
  label: string
  type: HTMLInputTypeAttribute
}

function Input({ field, label, ...props }: Props) {
  return <>
    <label htmlFor={field.name}>{label}</label>
    <input id={field.name} {...field} {...props} autoComplete='off' />
    <CustomFormikError name={field.name} />
  </>
}

function FakeCredentials() {
  return <div className={styles.fake_cred}>
    <p>Puede usar estas credenciales para acceder al modo administrador.</p>
    <p>
      Tenga en cuenta que los productos no se guardaran, editaran, ni eliminaran en la base de datos.
      Actualmente estas credenciales solo tienen el propósito de presentar la interfaz de administrador.
    </p>
    <ul>
      <ListItem name='Usuario' credential={TEST_ADMIN.name} />
      <ListItem name='Contraseña' credential={TEST_ADMIN.password} />
    </ul>
  </div>
}

interface ListItemProps {
  name: string
  credential: string
}

function ListItem({ name, credential }: ListItemProps) {
  return (
    <li>
      <b>{name}: </b>
      <span className={styles.fake_cred__item}>
        {credential} <CopyButton value={credential} />
      </span>
    </li>
  )
}

interface CopyButtonProps {
  value: string
}

function CopyButton({ value }: CopyButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [color, setColor] = useState('transparent')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setColor(getComputedStyle(document.documentElement).getPropertyValue('--bg3'))
    }
  }, [])

  const copy = () => {
    navigator.clipboard.writeText(value)
    setIsOpen(true)
  }

  return (
    <Popover
      isOpen={isOpen}
      onClickOutside={() => setIsOpen(false)}
      positions={['right']}
      content={({ position, childRect, popoverRect }) => (
        <ArrowContainer
          position={position}
          childRect={childRect}
          popoverRect={popoverRect}
          arrowColor={color}
          arrowSize={10}
          arrowStyle={{ opacity: 0.7 }}
          className='popover-arrow-container'
          arrowClassName='popover-arrow'
        >
          <div className={styles.fake_cred__tooltip}>Copiado!</div>
        </ArrowContainer>
      )}
    >
      <button className={styles.fake_cred__copy_btn} onClick={copy}><FaRegCopy /> Copiar</button>
    </Popover>
  )
}