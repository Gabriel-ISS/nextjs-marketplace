import styles from '@/_Components/Price.module.scss'
import { getLocalCurrency } from '@/_lib/utils'

interface Props {
  className?: string
  price: Product['price']
}

export default function Price({ price, className }: Props) {
  const { old, current } = price

  return !old || old < current ? (
    <span className={`${styles.price} ${className || ''}`}>{getLocalCurrency(current)}</span>
  ) : (
    <div>
      <span className={`${styles.price} ${styles['price--old']} ${className || ''}`}>{getLocalCurrency(old)}</span>
      <span className={`${styles.price} ${className || ''}`}>{getLocalCurrency(current)}</span>
    </div>
  )
}