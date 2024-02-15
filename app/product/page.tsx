import { getProduct } from '@/_lib/data'
import Product from '@/_Components/Product'
import styles from '@/product/page.module.scss'
import { getSafeUser } from '@/_lib/server-utils'


export default async function ProductPage({ searchParams }: PageProps) {
  const productRes = await getProduct(searchParams.id as string)
  const userRes = await getSafeUser()

  if (!productRes.success) throw new Error(productRes.error)

  return (
    <main className={styles.main}>
      <Product product={productRes.success} userCart={userRes.success?.cart || []} />
    </main>
  )
}