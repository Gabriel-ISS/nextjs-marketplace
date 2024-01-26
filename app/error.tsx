'use client'

import { C_ERROR_TAG, S_ERROR_TAG } from '@/constants'
import style from '@/error.module.scss'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isFromServer = error.message.startsWith(S_ERROR_TAG)
  const isFromClient = error.message.startsWith(C_ERROR_TAG)

  let message = 'Algo ha salido mal'
  if (isFromServer) {
    message = error.message.slice(S_ERROR_TAG.length)
  } else if (isFromClient) {
    message = error.message.slice(C_ERROR_TAG.length)
  }

  return (
    <div className={style.container}>
      <h2>Error</h2>
      <p className={style.description}>{message}</p>
      <button className={style.btn} onClick={() => reset()}>Intentar de nuevo</button>
    </div>
  )
}