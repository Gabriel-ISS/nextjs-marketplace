'use client'

import MessageModal from '@/_Components/Modal/MessageModal';
import useWritableState from '@/_hooks/useWritableState';
import useAppStore from '@/_store/useStore';
import style from '@/admin/auth/page.module.scss';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, HTMLInputTypeAttribute } from 'react';

export default function () {
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
      <form className={style.container}
        onSubmit={e => {
          e.preventDefault()
          login()
        }}
        onKeyDown={e => {
          if (e.key == 'Enter') login()
        }}>
        <Input className={style.input} label='Usuario' field='name' value={credentials.name} handler={textHandler} />
        <Input className={style.input} label='Contraseña' inputType='password' field='password' value={credentials.password} handler={textHandler} />
        <button className={style.login_btn} type='submit'>Ingresar</button>
      </form>
    </main>
  )
}

interface InputProps {
  label: string
  field: string
  value: string | number
  handler(field: string, value: string): void
  inputType?: HTMLInputTypeAttribute
  as?: string
  className?: string
}

export function Input({ label, field, value, handler, inputType, as, className }: InputProps) {
  const imp = React.createElement(as || 'input', {
    type: inputType || 'text',
    value,
    onChange: inputHandler,
    name: field,
    required: true,
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