'use client'

import { CartProductsReturn } from '@/_lib/data'
import { produce } from 'immer'
import { Dispatch, SetStateAction } from 'react'
import { PiMinusCircleLight, PiPlusCircleLight } from 'react-icons/pi'

interface Props {
  className: string
  productID: string
  quantity: number | undefined
  setCartProducts: Dispatch<SetStateAction<CartProductsReturn | null | undefined>>
}

export default function Counter({ className, productID, quantity, setCartProducts }: Props) {

  const updateQuantity = (quantity: 1 | -1) => {
    setCartProducts(produce(products => {
      if (!products) return;
      const index = products.findIndex(p => p._id == productID)
      const product = products[index]
      if (product.quantity) {
        product.quantity += quantity
      } else {
        // si no existe se asume que es uno y el usuario solo puede sumar
        product.quantity = 2
      }
    }))
  }

  return (
    <div className={className}>
    <button title='Agregar uno mas' onClick={() => updateQuantity(1)}><PiPlusCircleLight size='1.5rem' /></button>
    {quantity || 1}
    <button title='Eliminar 1' onClick={() => updateQuantity(-1)} disabled={!quantity || quantity <= 1}><PiMinusCircleLight size='1.5rem' /></button>
  </div>
  )
}