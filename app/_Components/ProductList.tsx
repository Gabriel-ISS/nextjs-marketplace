'use client'

import Loader from '@/_Components/Loader'
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
  const [products, setProducts, isLoading, _setLoading] = useFetch<Product[] | null>({
    fetcher: () => getProducts(searchParams),
    dependencyList: [searchParams]
  })

  return (
    <section className={style.products}>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando productos...</span>}>
        {products && products.map(product => (
          <ProductItem key={product._id} product={product} adminMode={adminMode} setProducts={setProducts as StateUpdater<Product[]>} />
        ))}
      </Loader>
    </section>
  )
}