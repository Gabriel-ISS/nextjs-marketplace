import ErrorBlock from '@/_reusable_components/ErrorBlock'
import Pagination from '@/products/_components/Pagination'
import ProductItem from '@/products/_components/ProductItem'
import styles from '@/products/_components/ProductList.module.scss'
import { getProducts } from '@/_lib/server-only/data'


interface Props {
  adminMode: boolean
  query: string
}

export default async function ProductList({ adminMode, query }: Props) {
  const res = await getProducts(query)

  if (res.error) return <ErrorBlock>{res.error}</ErrorBlock>

  return (
    <section className={styles.section}>
      {res.success?.products.length ? (
        <div className={styles.products}>
          {res.success?.products.map(product => (
            <ProductItem key={product._id} product={product} adminMode={adminMode} />
          ))}
        </div>
      ) : (
        <div className='center center--fill-space'>No se encontraron resultados...</div>
      )}
      {<Pagination totalPages={res.success?.totalPages || 0} />}
    </section>
  )
}