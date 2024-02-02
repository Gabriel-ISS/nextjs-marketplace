import Link from 'next/link'
import styles from '@/error.module.scss'
 
export default function NotFound() {
  return (
    <div className={styles.container}>
      <h2>404 No encontrado</h2>
      <p className={styles.description}>No se a podido encontrar la pagina consultada</p>
      <Link className={styles.btn} role='button' href="/">Volver a la pagina de bienvenida</Link>
    </div>
  )
}