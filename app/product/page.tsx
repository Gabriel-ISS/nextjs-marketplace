import { getProduct } from '@/_lib/data'
import Product from '@/_Components/Product'
import style from '@/product/page.module.scss'


export default async function ({ searchParams }: PageProps) {
  const product = await getProduct(searchParams.id as string)

  return (
    <main className={style.main}>
      <Product product={product} />
    </main>
  )
}