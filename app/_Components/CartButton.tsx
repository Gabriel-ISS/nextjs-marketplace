'use client'

import styles from '@/_Components/CartButton.module.scss'
import MessageModal from '@/_Components/Modal/MessageModal'
import { addToCart, removeFromCart } from '@/_lib/actions'
import useAppStore from '@/_store/useStore'
import { useOptimistic } from 'react'


interface Props {
  productID: string
  userCart: string[]
}

export default function CartButton({ productID, userCart }: Props) {
  const openModal = useAppStore(s => s.modal.open)
  const [isInCart, setIsInCart] = useOptimistic(userCart.includes(productID), (state, newState: boolean) => newState)

  const handleClick = async () => {
    let res: ActionRes | undefined;
    if (isInCart) {
      setIsInCart(false)
      res = await removeFromCart(productID)
    } else {
      setIsInCart(true)
      res = await addToCart(productID)
    }
    if (res?.error) {
      openModal(<MessageModal title='Error' message={res.error} />, 'red')
    }
  }

  return (
    <button className={`${styles.btn} ${isInCart ? styles['btn--red'] : ''}`} onClick={handleClick}>{isInCart ? 'Eliminar del carrito' : 'Agregar al carrito'}</button>
  )
}