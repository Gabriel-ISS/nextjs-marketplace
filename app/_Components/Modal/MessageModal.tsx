import styles from '@/_Components/Modal/MessageModal.module.scss';
import { Header } from '@/_Components/Modal/Modal';
import { clearErrorMessage } from '@/_lib/utils';
import useAppStore from '@/_store/useStore';


interface Props {
  title?: 'Éxito' | 'Error' | 'Advertencia'
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

  return <div className={styles.mm}>
    <Header>{title || 'Aviso'}</Header>
    <div className={styles.mm__message}>{title == 'Error' ? clearErrorMessage(message): message}</div>
    <button className={styles.mm__btn} data-theme={theme} onClick={accept}>Aceptar</button>
  </div>
}