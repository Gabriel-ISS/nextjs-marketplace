export const dynamic = 'force-dynamic'

import ErrorBlock from '@/_reusable_components/ErrorBlock'
import ProductGroup from '@/_components/ProductGroup'
import Search from '@/_reusable_components/Search'
import { satisfy } from '@/_lib/fonts'
import { getCategoriesWithImage, getProductGroups } from '@/_lib/server-only/data'
import styles from '@/page.module.scss'
import Image from 'next/image'
import { ComponentProps } from 'react'


export default async function App() {
  const [productGroups, productCategories] = await Promise.all([
    getProductGroups(),
    getCategoriesWithImage()
  ])

  return (
    <main>
      <section className={styles.search_section}>
        <Image className={styles.search_section__img} src='/header.jpg' alt='' fill quality={90} priority />
        <div className={styles.search_section__container}>
          <div className={styles.search_section__text_container}>
            <span className={`${satisfy.className} ${styles.search_section__title}`}>NextMarket</span>
            <p className={styles.search_section__slogan}>Encuentre toda la electronica que necesita en un solo lugar.</p>
            <p className={styles.search_section__slogan}>Explore nuestro catálogo de productos de calidad y aproveche nuestras ofertas especiales.</p>
          </div>
          <div className={styles.search_section__searcher_container}>
            <Search className={styles.search_section__searcher} />
          </div>
        </div>
      </section>
      {
        !productGroups.success ?
          <ErrorBlock>{productGroups.error}</ErrorBlock> :
          <ProductSection title='Encuentre en NextMarket' data={productGroups.success} type='tag' />
      }
      {
        !productCategories.success ?
          <ErrorBlock>{productCategories.error}</ErrorBlock> :
          <ProductSection title='Variedad de productos electrónicos' data={productCategories.success} type='category' />
      }
    </main>
  )
}

interface Props {
  title: string
  data: Pick<Group, 'name' | 'imgPath'>[]
  type: ComponentProps<typeof ProductGroup>['type']
}

function ProductSection({ title, data, type }: Props) {
  return (
    <section className={styles.products}>
      <h2 className={`${satisfy.className} ${styles.products__title}`}>{title}</h2>
      <ul className={styles.products__container}>
        {data.map(group => (
          <ProductGroup key={group.name} name={group.name} imgPath={group.imgPath} type={type} />
        ))}
      </ul>
    </section>
  )
}
