'use client'

import { clearErrorMessage } from '@/_lib/utils'
import style from '@/error.module.scss'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  return (
    <div className={style.container}>
      <h2>Error</h2>
      <p className={style.description}>{clearErrorMessage(error.message)}</p>
      <button className={style.btn} onClick={() => reset()}>Intentar de nuevo</button>
    </div>
  )
}