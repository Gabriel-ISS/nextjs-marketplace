//export const dynamic = 'force-dynamic'

import Filters from '@/_Components/Filters/Filters';
import ProductList from '@/_Components/ProductList';
import Search from '@/_Components/Search';
import { CenteredSpinner } from '@/_Components/Spinner';
import { getSafeUser } from '@/_lib/server-utils';
import { isAdmin } from '@/_lib/utils';
import styles from '@/products/page.module.scss';
import Link from 'next/link';
import QueryString from 'qs';
import { Suspense } from 'react';
import { AiFillFileAdd } from 'react-icons/ai';


export default async function Products({ searchParams }: PageProps) {
  const res = await getSafeUser()
  const adminMode = Boolean(res.success && isAdmin(res.success))
  const query = QueryString.stringify(searchParams)

  return (
    <main className={styles.main}>
      <Filters />
      <div className={styles.principal_view} data-mode-admin={adminMode}>
        <Search className={styles.search} />
        {adminMode && (
          <Link className={styles.add_product_btn} href='/admin/product' role='button'>Registrar producto <AiFillFileAdd /></Link>
        )}
        <Suspense key={query} fallback={<CenteredSpinner />}>
          <ProductList adminMode={adminMode} query={query} />
        </Suspense>
      </div>
    </main>
  )
}