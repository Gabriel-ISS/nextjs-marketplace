import style from '@/page.module.scss'
import Search from '@/_Components/Search'
import ProductGroup from '@/_Components/ProductGroup'
import { satisfy } from '@/_lib/fonts'
import { getProductTags as getProductGroups } from '@/_lib/data'


export default async function () {
  const productGroups = await getProductGroups()

  return (
    <main>
      <section className={style.search_section}>
        <div className={style.search_section__container}>
          <div className={style.search_section__text_container}>
            <span className={`${satisfy.className} ${style.search_section__title}`}>NextMarket</span>
            <p className={style.search_section__slogan}>Encuentre en todo lo que necesita en un solo lugar.</p>
          </div>
          <div className={style.search_section__searcher_container}>
            <Search className={style.search_section__searcher} />
          </div>
        </div>
      </section>
      <section className={style.products}>
        <h2 className={`${satisfy.className} ${style.products__title}`}>Encuentre en NextMarket</h2>
        <ul className={style.products__container}>
          {productGroups.map(group => (
            <ProductGroup key={group.name} name={group.name} image={group.image} />
          ))}
        </ul>
      </section>
    </main>
  )
}
