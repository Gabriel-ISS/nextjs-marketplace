export const dynamic = 'force-dynamic'

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
import WithSidebar, { SidebarContainer, SidebarToggleButton } from '@/_reusable_components/WithSidebar';
import { FaFilter } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import CategorySelector from '@/products/_components/Filters/CategorySelector';
import CategoryFiltersSelector from '@/products/_components/Filters/CategoryFiltersSelector';
import TagSelector from '@/products/_components/Filters/TagSelector';

//import f_styles from '@/products/_components/Filters/Filters.module.scss'


export default async function Products({ searchParams }: PageProps) {
  const res = await getSafeUser()
  const adminMode = Boolean(res.success && isAdmin(res.success))
  const query = QueryString.stringify(searchParams)

  return (
    <main>
      <WithSidebar sidebar={
        <SidebarContainer toggleButton={
          <SidebarToggleButton>{{
            whenClosed: <FaFilter size='70%' />,
            whenOpen: <IoMdClose size='100%' />
          }}</SidebarToggleButton>
        }>
          <CategorySelector />
          <CategoryFiltersSelector />
          <TagSelector />
        </SidebarContainer>
      }>
        <div className={styles.principal_view} data-mode-admin={adminMode}>
          <Search className={styles.search} />
          {adminMode && (
            <Link className={styles.add_product_btn} href='/product/editor' role='button'>Registrar producto <AiFillFileAdd /></Link>
          )}
          <Suspense key={query} fallback={<CenteredSpinner />}>
            <ProductList adminMode={adminMode} query={query} />
          </Suspense>
        </div>
      </WithSidebar>
    </main>
  )
}