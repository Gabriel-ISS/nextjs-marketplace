import Link from 'next/link'
import style from '@/error.module.scss'
 
export default function NotFound() {
  return (
    <div className={style.container}>
      <h2>404 No encontrado</h2>
      <p className={style.description}>No se a podido encontrar la pagina consultada</p>
      <Link className={style.btn} role='button' href="/">Volver a la pagina de bienvenida</Link>
    </div>
  )
}