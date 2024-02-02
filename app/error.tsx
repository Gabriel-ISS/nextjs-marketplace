'use client'

import { clearErrorMessage } from '@/_lib/utils'
import styles from '@/error.module.scss'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  return (
    <div className={styles.container}>
      <h2>Error</h2>
      <p className={styles.description}>{clearErrorMessage(error.message)}</p>
      <button className={styles.btn} onClick={() => reset()}>Intentar de nuevo</button>
    </div>
  )
}