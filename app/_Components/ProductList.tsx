'use client'

import Loader from '@/_Components/Loader'
import Pagination from '@/_Components/Pagination'
import ProductItem from '@/_Components/ProductItem'
import style from '@/_Components/ProductList.module.scss'
import useFetch from '@/_hooks/useFetch'
import { StateUpdater } from '@/_hooks/useWritableState'
import { getProducts } from '@/_lib/data'
import { useSearchParams } from 'next/navigation'


interface Props {
  adminMode: boolean
}

export default function ProductList({ adminMode }: Props) {
  const searchParams = useSearchParams().toString()
  const [data, setData, isLoading, _setLoading] = useFetch({
    fetcher: () => getProducts(searchParams),
    dependencyList: [searchParams]
  })

  const setProducts: StateUpdater<Product[]> = (updater) => {
    setData(prev => {
      updater(prev?.products as Product[])
    })
  }

  return (
    <section className={style.section}>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando productos...</span>}>
        {data && <>
          <div className={style.products}>
            {data.products.map(product => (
              <ProductItem key={product._id} product={product} adminMode={adminMode} setProducts={setProducts} />
            ))}
          </div>
          <Pagination totalPages={data.totalPages} />
        </>}
      </Loader>
    </section>
  )
}