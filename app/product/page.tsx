import Product from '@/_Components/Product'
import styles from '@/product/page.module.scss'
import { getCartProducts, getProduct, getSafeUser } from '@/_lib/server-only/data'


export default async function ProductPage({ searchParams }: PageProps) {
  const productRes = await getProduct(searchParams.id as string)
  const cartRes = await getCartProducts({ onlyIDs: true })

  if (!productRes.success) throw new Error(productRes.error)

  return (
    <main className={styles.main}>
      <Product product={productRes.success} userCart={cartRes.success || []} />
    </main>
  )
}