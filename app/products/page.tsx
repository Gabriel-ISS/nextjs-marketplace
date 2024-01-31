import Filters from '@/_Components/Filters/Filters';
import ProductList from '@/_Components/ProductList';
import Search from '@/_Components/Search';
import { getSafeUser } from '@/_lib/data';
import { isAdmin } from '@/_lib/utils';
import style from '@/products/page.module.scss';
import Link from 'next/link';
import { AiFillFileAdd } from 'react-icons/ai';


export default async function Products() {
  const res = await getSafeUser()
  const adminMode = Boolean(res.success && isAdmin(res.success))

  return (
    <main className={style.main}>
      <Filters />
      <div className={style.principal_view} data-mode-admin={adminMode}>
        <Search className={style.search} />
        {adminMode && (
          <Link className={style.add_product_btn} href='/admin/product' role='button'>Registrar producto <AiFillFileAdd /></Link>
        )}
        <ProductList adminMode={adminMode} />
      </div>
    </main>
  )
}