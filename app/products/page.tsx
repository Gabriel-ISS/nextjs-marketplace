import Filters from '@/_Components/Filters/Filters';
import ProductList from '@/_Components/ProductList';
import Search from '@/_Components/Search';
import style from '@/products/page.module.scss';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { AiFillFileAdd } from 'react-icons/ai'


export default async function () {
  const session = await getServerSession()
  const adminMode = session != null

  return (
    <main className={style.main}>
      <Filters />
      <div className={style.principal_view}>
        <Search className={style.search} />
        {adminMode && (
          <Link className={style.add_product_btn} href='/admin/product' role='button'>Registrar producto <AiFillFileAdd /></Link>
        )}
        <ProductList adminMode={adminMode} />
      </div>
    </main>
  )
}