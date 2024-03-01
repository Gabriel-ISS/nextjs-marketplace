'use client'

import styles from '@/product/_components/CartButton.module.scss'
import AddedToCartModal from '@/product/_components/AddedToCartModal'
import MessageModal from '@/_reusable_components/Modal/MessageModal'
import { addToCart, removeFromCart } from '@/_lib/actions'
import useAppStore from '@/_store/useStore'
import { useOptimistic } from 'react'


interface Props {
  product: Pick<Product, '_id' | 'name' | 'price'>
  userCart: string[]
}

export default function CartButton({ product, userCart }: Props) {
  const openModal = useAppStore(s => s.modal.open)
  const [isInCart, setIsInCart] = useOptimistic(userCart.includes(product._id), (state, newState: boolean) => newState)

  const handleClick = async () => {
    let res: ActionRes | undefined;
    if (isInCart) {
      setIsInCart(false)
      res = await removeFromCart(product._id)
    } else {
      setIsInCart(true)
      res = await addToCart(product._id)
      if (res?.success) {
        openModal(<AddedToCartModal />)
      }
    }
    if (res?.error) {
      openModal(<MessageModal title='Error' message={res.error} />, 'red')
    }
  }

  return (
    <button
      className={`${styles.btn} ${isInCart ? styles['btn--red'] : ''}`}
      onClick={handleClick}
      disabled={!product._id || !product._id.length}
    >
      {isInCart ? 'Eliminar del carrito' : 'Agregar al carrito'}
    </button>
  )
}