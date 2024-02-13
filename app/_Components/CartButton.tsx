'use client'

//import { addToCart, removeFromCart } from '@/_lib/actions'
//import { useOptimistic } from 'react'
//import styles from '@/_Components/CartButton.module.scss'


interface Props {
  productID: string 
  //card: string[]
}

export default function CartButton({ productID, /* card */ }: Props) {
  //const [isInCart, setIsInCart] = useOptimistic(card.includes(productID), (state, newState: boolean) => newState)
const isInCart = false
  const handleClick = () => {
    /* if (isInCart) {
      setIsInCart(false)
      removeFromCart(productID)
    } else {
      setIsInCart(true)
      addToCart(productID)
    } */
  }

  return (
    <button /* className={`${styles.btn} ${isInCart ? styles['btn--red'] : ''}`} */ onClick={handleClick}>{isInCart ? 'Eliminar del carrito' : 'Agregar al carrito'}</button>
  ) 
}