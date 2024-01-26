import style from '@/page.module.scss'
import Search from '@/_Components/Search'
import ProductGroup from '@/_Components/ProductGroup'
import { satisfy } from '@/_lib/fonts'
import { getCategoriesWithImage, getProductGroups } from '@/_lib/data'
import { ComponentProps } from 'react'
import { ClientError } from '@/_lib/utils'
import ErrorBlock from '@/_Components/ErrorBlock'

export default async function () {
  const productGroups = await getProductGroups()
  const productCategories = await getCategoriesWithImage()

  return (
    <main>
      <section className={style.search_section}>
        <div className={style.search_section__container}>
          <div className={style.search_section__text_container}>
            <span className={`${satisfy.className} ${style.search_section__title}`}>NextMarket</span>
            <p className={style.search_section__slogan}>Encuentre en toda la electronica que necesita en un solo lugar.</p>
          </div>
          <div className={style.search_section__searcher_container}>
            <Search className={style.search_section__searcher} />
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
  data: Pick<Group, 'name' | 'image'>[]
  type: ComponentProps<typeof ProductGroup>['type']
}

function ProductSection({ title, data, type }: Props) {
  return (
    <section className={style.products}>
      <h2 className={`${satisfy.className} ${style.products__title}`}>{title}</h2>
      <ul className={style.products__container}>
        {data.map(group => (
          <ProductGroup key={group.name} name={group.name} image={group.image} type={type} />
        ))}
      </ul>
    </section>
  )
}
