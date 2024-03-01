export const dynamic = 'force-dynamic'

import Filters from '@/products/_components/Filters/Filters';
import ProductList from '@/products/_components/ProductList';
import Search from '@/_reusable_components/Search';
import { CenteredSpinner } from '@/_reusable_components/Spinner';
import { getSafeUser } from '@/_lib/server-only/data';
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
          <Link className={styles.add_product_btn} href='/product/editor' role='button'>Registrar producto <AiFillFileAdd /></Link>
        )}
        <Suspense key={query} fallback={<CenteredSpinner />}>
          <ProductList adminMode={adminMode} query={query} />
        </Suspense>
      </div>
    </main>
  )
}