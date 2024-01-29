import ErrorBlock from '@/_Components/ErrorBlock'
import ProductGroup from '@/_Components/ProductGroup'
import Search from '@/_Components/Search'
import { getCategoriesWithImage, getProductGroups } from '@/_lib/data'
import { satisfy } from '@/_lib/fonts'
import style from '@/page.module.scss'
import { ComponentProps } from 'react'

export default async function App() {
  const productGroups = await getProductGroups()
  const productCategories = await getCategoriesWithImage()

  return (
    <main>
      <section className={style.search_section}>
        <div className={style.search_section__container}>
          <div className={style.search_section__text_container}>
            <span className={`${satisfy.className} ${style.search_section__title}`}>NextMarket</span>
            <p className={style.search_section__slogan}>Encuentre toda la electronica que necesita en un solo lugar.</p>
            <p className={style.search_section__slogan}>Explore nuestro catálogo de productos de calidad y aproveche nuestras ofertas especiales.</p>
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
