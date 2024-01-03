'use client'

import style from '@/_Components/ProductList.module.scss'
import ProductItem from '@/_Components/ProductItem'
import { useEffect, useState } from 'react'
import useLoadState from '@/_hooks/useLoadState'
import { getProducts } from '@/_lib/data'
import QueryString from 'qs'
import { useSearchParams } from 'next/navigation'
import Loader from '@/_Components/Loader'
import useFetch from '@/_hooks/useFetch'
import { StateUpdater } from '@/_hooks/useWritableState'


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
      <Loader isLoading={isLoading} meanwhile={<span>Cargando productos</span>}>
        {products && products.map(product => (
          <ProductItem key={product._id} product={product} adminMode={adminMode} setProducts={setProducts as StateUpdater<Product[]>} />
        ))}
      </Loader>
    </section>
  )
}