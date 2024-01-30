'use client'

import MessageModal from '@/_Components/Modal/MessageModal';
import useWritableState from '@/_hooks/useWritableState';
import useAppStore from '@/_store/useStore';
import style from '@/admin/auth/page.module.scss';
import { TEST_ADMIN } from '@/constants';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, HTMLInputTypeAttribute } from 'react';

export default function Auth() {
  const router = useRouter()
  const openModal = useAppStore(s => s.modal.open)
  const [credentials, setCredentials] = useWritableState({
    name: '',
    password: ''
  })

  const login = async () => {
    const res = await signIn('credentials', {
      ...credentials,
      callbackUrl: '/products',
      redirect: false
    })
    if (res?.error) {
      openModal(<MessageModal title='Error' message={res.error} />, 'red')
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
    <main className={style.main}>
      <FakeCredentials />
      <form className={style.container}
        onSubmit={e => {
          e.preventDefault()
          login()
        }}
        onKeyDown={e => {
          if (e.key == 'Enter') login()
        }}>
        <Input className={style.input} label='Usuario' minLength={5} field='name' value={credentials.name} handler={textHandler} />
        <Input className={style.input} label='Contraseña' minLength={14} field='password' value={credentials.password} handler={textHandler} inputType='password' />
        <button className={style.login_btn} type='submit'>Ingresar</button>
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
  return <div className={style.fake_cred}>
      <p>Puede usar estas credenciales para acceder al modo administrador.</p>
      <p>
        Tenga en cuenta que los productos no se guardaran, editaran, ni eliminaran en la base de datos.
        Actualmente estas credenciales solo tienen el propósito de presentar la interfaz de administrador.
      </p>
    <ul>
      <li><b>Usuario</b>: {TEST_ADMIN.name}</li>
      <li><b>Contraseña</b>: f#@UxR79mmjL&B</li>
    </ul>
  </div>
}