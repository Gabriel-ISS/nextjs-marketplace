import { Header } from '@/_Components/Modal/Modal';
import useAppStore from '@/_store/useStore';
import style from '@/_Components/Modal/MessageModal.module.scss'


interface Props {
  title: 'Éxito' | 'Error' | 'Advertencia'
  message: string
  onAccept?(): void
  closeOnAccept?: boolean
}

export default function MessageModal({ title, message, onAccept, closeOnAccept }: Props) {
  const close = useAppStore(s => s.modal.close)
  const theme = useAppStore(s => s.modal.element.theme)

  function accept() {
    if (closeOnAccept == undefined || closeOnAccept) close()
    onAccept && onAccept()
  }

  return <div className={style.mm}>
    <Header>{title}</Header>
    <div className={style.mm__message}>{message}</div>
    <button className={style.mm__btn} data-theme={theme} onClick={accept}>Aceptar</button>
  </div>
}