import { getProduct } from '@/_lib/data'
import Product from '@/_Components/Product'
import style from '@/product/page.module.scss'


export default async function ({ searchParams }: PageProps) {
  const productRes = await getProduct(searchParams.id as string)

  if (!productRes.success) throw new Error(productRes.error)

  return (
    <main className={style.main}>
      <Product product={productRes.success} />
    </main>
  )
}