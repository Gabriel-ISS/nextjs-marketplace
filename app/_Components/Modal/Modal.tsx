'use client'

import { useCallback, useEffect, useRef } from 'react'
import { IoMdClose } from 'react-icons/io'
import useAppStore from '@/_store/useStore'
import useLockScroll from '@/_hooks/useLockScroll'
import useCollapse from '@/_hooks/useCollapse'
import styles from '@/_Components/Modal/Modal.module.scss'


export default function Modal() {
  const ref = useRef<HTMLDialogElement>(null)
  const { element: { isActive, content, theme }, onCloseEnd, close } = useAppStore(s => s.modal)
  const { lockScroll, unlockScroll } = useLockScroll()
  const { state, startOpen, startClose, handleTransitionEnd } = useCollapse({
    onOpening() {
      lockScroll()
      ref.current?.showModal()
    },
    onCloseEnd() {
      unlockScroll()
      ref.current?.close()
      onCloseEnd()
    }
  })

  const escHandler = useCallback((e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      e.preventDefault()
      close()
    }
  }, [])

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', escHandler)
      startOpen()
    } else {
      document.removeEventListener('keydown', escHandler)
      startClose()
    }
  }, [isActive])

  return (
    <dialog ref={ref} className={styles.modal} data-state={state} data-theme={theme} onTransitionEnd={handleTransitionEnd}>
      {content}
    </dialog>
  )
}

interface HeaderProps {
  children: string
  onClose?: () => void
}

export function Header({ children, onClose }: HeaderProps) {
  const close = useAppStore(s => s.modal.close)
  const theme = useAppStore(s => s.modal.element.theme)

  function closeModal() {
    close()
    if (onClose) onClose()
  }

  return (
    <div className={styles.modal__header}>
      <h2 className={styles.modal__title} data-theme={theme}>{children}</h2>
      <button className={styles.modal__close_btn} data-theme={theme} onClick={closeModal}>
        <IoMdClose size='1.9rem' />
      </button>
    </div>
  )
}
