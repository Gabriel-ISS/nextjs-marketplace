'use client'

import ErrorBlock from '@/_Components/ErrorBlock'
import Loader from '@/_Components/Loader'
import Pagination from '@/_Components/Pagination'
import ProductItem from '@/_Components/ProductItem'
import styles from '@/_Components/ProductList.module.scss'
import useFetch from '@/_hooks/useFetch'
import { StateUpdater } from '@/_hooks/useWritableState'
import { getProducts } from '@/_lib/data'
import { produce } from 'immer'
import { useSearchParams } from 'next/navigation'


interface Props {
  adminMode: boolean
}

export default function ProductList({ adminMode }: Props) {
  const searchParams = useSearchParams().toString()

  const { error, data, isLoading, setData } = useFetch<SuccessRes<typeof getProducts>>(
    ({ manager }) => manager(() => getProducts(searchParams)),
    [searchParams]
  )

  const setProducts: StateUpdater<Product[]> = (updater) => {
    setData(produce(prev => {
      updater(prev?.products as Product[])
    }))
  }

  if (error) return <ErrorBlock>{error}</ErrorBlock>

  return (
    <section className={styles.section}>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando productos...</span>}>
        {data && <>
          <div className={styles.products}>
            {data.products.map(product => (
              <ProductItem key={product._id} product={product} adminMode={adminMode} setProducts={setProducts} />
            ))}
          </div>
        </>}
      </Loader>
      <Pagination totalPages={data?.totalPages || 0} />
    </section>
  )
}