import ErrorBlock from '@/_Components/ErrorBlock'
import Pagination from '@/_Components/Pagination'
import ProductItem from '@/_Components/ProductItem'
import styles from '@/_Components/ProductList.module.scss'
import { getProducts } from '@/_lib/data'


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