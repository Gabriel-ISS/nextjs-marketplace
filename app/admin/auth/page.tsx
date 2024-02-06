'use client'

import MessageModal from '@/_Components/Modal/MessageModal';
import useWritableState from '@/_hooks/useWritableState';
import useAppStore from '@/_store/useStore';
import styles from '@/admin/auth/page.module.scss';
import { TEST_ADMIN } from '@/constants';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, HTMLInputTypeAttribute, useEffect, useState } from 'react';
import { TbLoader2 } from "react-icons/tb";
import { ArrowContainer, Popover } from 'react-tiny-popover';
import { FaRegCopy } from "react-icons/fa";
import { revalidatePath } from 'next/cache';



export default function Auth() {
  const router = useRouter()
  const openModal = useAppStore(s => s.modal.open)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [credentials, setCredentials] = useWritableState({
    name: '',
    password: ''
  })


  const login = async () => {
    setIsSubmitting(true)
    const res = await signIn('credentials', {
      ...credentials,
      callbackUrl: '/products',
      redirect: false
    })
    if (res?.error) {
      openModal(<MessageModal title='Error' message={res.error} onAccept={() => {
        setCredentials(prev => { prev.password = '' })
      }} />, 'red')
      setIsSubmitting(false)
    } else {
      router.push(res?.url as string)
    }
  }

  const textHandler = (field: string, value: string) => {
    setCredentials(c => {
      c[field as keyof typeof credentials] = value
    })
  }

  return (
    <main className={styles.main}>
      <FakeCredentials />
      <form className={styles.container}
        onSubmit={e => {
          e.preventDefault()
          login()
        }}
        onKeyDown={e => {
          if (e.key == 'Enter') login()
        }}>
        <Input className={styles.input} label='Usuario' minLength={5} field='name' value={credentials.name} handler={textHandler} />
        <Input className={styles.input} label='Contraseña' minLength={14} field='password' value={credentials.password} handler={textHandler} inputType='password' />
        <button className={styles.login_btn} type='submit'>{isSubmitting ? <>Verificando <TbLoader2 className={styles.loader} /></> : 'Ingresar'}</button>
      </form>
    </main>
  )
}

interface InputProps {
  label: string
  field: string
  value: string | number
  minLength: number
  handler(field: string, value: string): void
  inputType?: HTMLInputTypeAttribute
  as?: string
  className?: string
}

function Input({ label, field, value, minLength, handler, inputType, as, className }: InputProps) {
  const imp = React.createElement(as || 'input', {
    type: inputType || 'text',
    value,
    onChange: inputHandler,
    name: field,
    required: true,
    minLength: minLength,
    maxLength: 25,
    className
  })

  function inputHandler(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    handler(field, e.currentTarget.value)
  }

  return <div>
    <label>{label}</label>
    {imp}
  </div>
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