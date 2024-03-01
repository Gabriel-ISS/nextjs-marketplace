'use client'

import useFetch from '@/_hooks/useFetch'
import { removeCart } from '@/_lib/actions'
import { GetCartProductsReturn, getCartProducts } from '@/_lib/data'
import { getLocalCurrency } from '@/_lib/utils'
import Loader from '@/_reusable_components/Loader'
import MessageModal from '@/_reusable_components/Modal/MessageModal'
import { CenteredSpinner } from '@/_reusable_components/Spinner'
import useAppStore from '@/_store/useStore'
import Counter from '@/cart/_components/Counter'
import RemoveFromCartButton from '@/cart/_components/RemoveFromCartButton'
import styles from '@/cart/page.module.scss'
import { S_ERROR_TAG } from '@/constants'
import Link from 'next/link'
import { useMemo } from 'react'


export default function Cart() {
  const openModal = useAppStore(s => s.modal.open)
  const { data, error, isLoading, setData } = useFetch<GetCartProductsReturn['success']>(({ manager }) => {
    return manager(() => getCartProducts({}))
  })

  const calcTotal = (price: number, quantity: number = 1) => price * quantity

  const total = useMemo(() => data?.reduce((t, prod) => (t + calcTotal(prod.price.current, prod.quantity)), 0) || 0, [data])

  const centeredMessage = (message: string) => (
    <main className={styles.main}>
      <div>{message}</div>
    </main>
  )

  if (error) {
    let message = 'Algo ha salido mal'
    if (error.startsWith(S_ERROR_TAG)) message = error.slice(S_ERROR_TAG.length)
    return centeredMessage(message)
  }
  if (data && !data.length) return centeredMessage('Aun no hay productos')

  const getImgLink = (path: string) => process.env.NEXT_PUBLIC_IMAGE_KIT_BASE_URL + path + '?tr=w-150'

  const notAvailableFunction = () => {
    openModal(<MessageModal message='Esta es una demo, por lo tanto no hay función de pago' onAccept={async () => {
      const res = await removeCart()
      if (res && res.error) {
        openModal(<MessageModal title='Error' message={res.error} />)
      } else {
        setData([])
        openModal(<MessageModal title='Éxito' message='¡Gracias por su compra!' />, 'green')
      }
    }} />)
  }

  return (
    <main className={styles.main}>
      <Loader isLoading={isLoading} meanwhile={<CenteredSpinner />}>
        {data && (
          <div className={styles.container}>
            <section>
              {data.map(product => (
                <article className={styles.product} key={product._id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.product__img} src={getImgLink(product.imgPath)} alt="Imagen del producto" />
                  <div>
                    <Link href={`/product?id=${product._id}`} target='_blank'><h3 className={styles.product__name}>{product.name}</h3></Link>
                    <div className={styles.product__price_container}>
                      <Counter className={styles.product__counter} productID={product._id} quantity={product.quantity} setCartProducts={setData} />
                      <div className={styles.product__price}>{getLocalCurrency(calcTotal(product.price.current, product.quantity))}</div>
                    </div>
                    <RemoveFromCartButton className={styles.product__remove_btn} productID={product._id} setCartProducts={setData} />
                  </div>
                </article>
              ))}
            </section>
            <section className={styles.total}>
              <span>Total: </span>
              <span>{getLocalCurrency(total)}</span>
            </section>
            <button className={styles.buy_btn} onClick={notAvailableFunction}>Comprar</button>
          </div>
        )}
      </Loader>
    </main>
  )
}