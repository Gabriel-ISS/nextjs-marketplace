import style from '@/page.module.scss'
import Search from '@/_Components/Search'
import ProductGroup from '@/_Components/ProductGroup'
import { exo2 } from '@/_lib/fonts'
import { getProductTags as getProductGroups } from '@/_lib/data'


export default async function () {
  const productGroups = await getProductGroups()

  return (
    <main>
      <section className={style.search_section}>
        <Search />
      </section>
      <section className={style.products}>
        <h2 className={`${exo2.className} ${style.products__title}`}>Encuentre en NextMarket</h2>
        <ul className={style.products__container}>
          {productGroups.map(group => (
            <ProductGroup key={group.name} name={group.name} image={group.image} />
          ))}
        </ul>
      </section>
    </main>
  )
}
