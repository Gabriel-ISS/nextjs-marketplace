'use client'

import useFetch from '@/_hooks/useFetch'
import { saveProduct } from '@/_lib/actions'
import { getProduct } from '@/_lib/data'
import { productSchema } from '@/_lib/validation-schemas'
import ErrorBlock from '@/_reusable_components/ErrorBlock'
import Loader from '@/_reusable_components/Loader'
import MessageModal from '@/_reusable_components/Modal/MessageModal'
import { CenteredSpinner } from '@/_reusable_components/Spinner'
import WithSidebar, { SidebarContainer, SidebarToggleButton } from '@/_reusable_components/WithSidebar'
import useAppStore from '@/_store/useStore'
import { CustomForm } from '@/product/_components/CustomForm'
import Product from '@/product/_components/Product'
import { Formik } from 'formik'
import { produce } from 'immer'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaEye } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md';


let newFilters: NewFilters = {
  category: '',
  category_img: '',
  brand: '',
  properties: [],
  tags: []
}

// solo para inputs tipo radio
let lastSelectedIsNew = {
  category: false,
  brand: false
}

export default function ProductEditor({ searchParams }: PageProps) {
  const router = useRouter()
  const { openModal } = useAppStore(s => ({
    openModal: s.modal.open,
    setCategories: s.filters.categories.setter,
    setCategoryFilters: s.filters.categoryFilters.setter,
    setTags: s.filters.tags.setter
  }))
  const [originalPrice, setOriginalPrice] = useState(0)


  const { error, isLoading, data: initialProduct, setData: setInitialProduct } = useFetch<Product>(async ({ setLoading, actionResHandler }) => {
    (async () => {
      setLoading(true)
      const res = await getProduct(searchParams.id)
      actionResHandler(res)
      if (!res.success) return;

      const product = res.success
      setInitialProduct(product)
      setOriginalPrice(product.price.current)
      newFilters = { category: '', category_img: '', brand: '', properties: [], tags: [] }
      lastSelectedIsNew = { category: false, brand: false }
      setLoading(false)
      return;
    })()
  }, [])

  if (error) return <ErrorBlock>{error}</ErrorBlock>

  async function save(product: Product) {
    const finalProduct = produce(product, p => {
      if (originalPrice > p.price.current) {
        p.price.old = originalPrice
      }
      p.properties = p.properties.filter(property => property.values.length)
    })
    const res = await saveProduct(finalProduct, newFilters.tags, newFilters.category_img)
    if (res.success) {
      openModal(<MessageModal title='Éxito' message={res.success} onAccept={() => router.push('/products')} />, 'green')
    }
    if (res.error) {
      openModal(<MessageModal title='Error' message={res.error} />, 'red')
    }
  }

  return (
    <main>
      <Loader isLoading={isLoading} meanwhile={<CenteredSpinner />}>
        {initialProduct && <>
          <Formik<Product>
            initialValues={initialProduct}
            validationSchema={productSchema}
            onSubmit={save}
          >
            {({ isSubmitting, errors, values }) => (
              <WithSidebar
                sidebar={
                  <SidebarContainer toggleButton={<CustomSidebarToggleButton />}>
                    <CustomForm
                      product={values}
                      originalPrice={originalPrice}
                      newFilters={newFilters}
                      lastSelectedIsNew={lastSelectedIsNew}
                      isSubmitting={isSubmitting}
                    />
                  </SidebarContainer>
                }
              >
                <section className='center'>
                  <Product product={values} userCart={[]} />
                </section>
              </WithSidebar>
            )}
          </Formik>
        </>}
      </Loader>
    </main>
  )
}

function CustomSidebarToggleButton() {
  return (
    <SidebarToggleButton>
      {{
        whenOpen: <FaEye size='100%' />,
        whenClosed: <MdEdit size='100%' />
      }}
    </SidebarToggleButton>
  )
}