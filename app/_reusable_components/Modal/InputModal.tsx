'use client'

import styles from '@/_reusable_components/Modal/InputModal.module.scss'
import { Header } from '@/_reusable_components/Modal/Modal'
import useAppStore from '@/_store/useStore'
import { MouseEvent, useState } from 'react'


interface Props {
  title: string
  onAccept: (value: string) => void
}

export default function Modal({ title, onAccept }: Props) {
  const close = useAppStore(s => s.modal.close)
  const [value, setValue] = useState('')

  function accept(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    onAccept(value)
    close()
  }

  return (
    <>
    <Header>{title}</Header>
    <form className={styles.form}>
      <input className={styles.form__input} type="text" value={value} onChange={e => setValue(e.target.value)} autoFocus />
      <button className={styles.form__btn} onClick={accept} formMethod='dialog'>Aceptar</button>
    </form>
    </>
  )
}