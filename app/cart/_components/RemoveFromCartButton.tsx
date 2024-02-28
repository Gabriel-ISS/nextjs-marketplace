'use client'

import { CiSquareRemove } from 'react-icons/ci'
import styles from '@/cart/_components/RemoveFromCartButton.module.scss'
import { Dispatch, SetStateAction } from 'react'
import { produce } from 'immer'
import { CartProductsReturn } from '@/_lib/data'


interface Props {
  className: string
  productID: string
  setCartProducts: Dispatch<SetStateAction<CartProductsReturn | null | undefined>>
}

export default function RemoveFromCartButton({ className, productID, setCartProducts }: Props) {
  
  const deleteProduct = () => {
    setCartProducts(produce(products => {
      if (!products) return;
      const index = products.findIndex(p => p._id == productID)
      products.splice(index, 1)
    }))
  }

  return (
    <button className={`${styles.btn} ${className}`} onClick={deleteProduct} title='Eliminar del carrito'>
      <CiSquareRemove size='2rem' />
    </button>
  )
}