import style from '@/_Components/Price.module.scss'
import { getLocalCurrency } from '@/_lib/utils'

interface Props {
  className?: string
  price: Product['price']
}

export default function Price({ price, className }: Props) {
  const { old, current } = price

  return !old || old < current ? (
    <span className={`${style.price} ${className || ''}`}>{getLocalCurrency(current)}</span>
  ) : (
    <div>
      <span className={`${style.price} ${style['price--old']} ${className || ''}`}>{getLocalCurrency(old)}</span>
      <span className={`${style.price} ${className || ''}`}>{getLocalCurrency(current)}</span>
    </div>
  )
}