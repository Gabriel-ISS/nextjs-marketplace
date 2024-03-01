'use client'

import inputStyles from '@/_reusable_components/Inputs.module.scss'
import ErrorBlock from '@/_reusable_components/ErrorBlock'
import CategoryFiltersSelector from '@/product/editor/_components//CategoryFiltersSelector'
import CategorySelector from '@/product/editor/_components//CategorySelector'
import TagSelector from '@/product/editor/_components//TagSelector'
import { CustomFormikError, ImageFileData } from '@/_reusable_components/Inputs'
import Loader from '@/_reusable_components/Loader'
import CropImageModal from '@/_reusable_components/Modal/CropImageModal'
import InputModal from '@/_reusable_components/Modal/InputModal'
import MessageModal from '@/_reusable_components/Modal/MessageModal'
import NamedImageModal from '@/_reusable_components/Modal/NamedImageModal'
import { CenteredSpinner } from '@/_reusable_components/Spinner'
import useFetch from '@/_hooks/useFetch'
import { StateUpdater } from '@/_hooks/useWritableState'
import { saveProduct } from '@/_lib/actions'
import { getProduct } from '@/_lib/data'
import { getBase64 } from '@/_lib/utils'
import { productSchema } from '@/_lib/validation-schemas'
import useAppStore from '@/_store/useStore'
import Product from '@/product/_components/Product'
import styles from '@/product/editor/page.module.scss'
import { Field, Form, Formik, FormikContextType } from 'formik'
import { produce } from 'immer'
import { useRouter } from 'next/navigation'
import { ChangeEvent, ChangeEventHandler, FocusEventHandler, HTMLInputTypeAttribute, useState } from 'react'


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
  const { openModal, setCategories, setCategoryFilters, setTags } = useAppStore(s => ({
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

  function imageHandler(data: ImageFileData, setProduct: StateUpdater<Product>) {
    openModal(<CropImageModal imageData={data} onSaveCrop={croppedImage => {
      setProduct(product => {
        product.imgPath = croppedImage
      })
    }} />)
  }

  function priceHandler(e: ChangeEvent<HTMLInputElement>, setProduct: StateUpdater<Product>) {
    const value = e.currentTarget.value

    setProduct(product => {
      const newPrice = parseInt(value) || 0
      if (originalPrice > newPrice) {
        product.price.old = originalPrice
      }
      product.price.current = newPrice
    })
  }

  function addCategory(setProduct: StateUpdater<Product>) {
    openModal(<NamedImageModal title='Agregar categoría' onAccept={(category, img) => {
      // omit
      const categories = useAppStore.getState().filters.categories.state.data
      if (categories.includes(category)) return;

      setCategories(categories => {
        if (newFilters.category.length) {
          // update
          categories[categories.length - 1] = category
        } else {
          // add
          categories.push(category)
        }
      })

      // update newFilters
      newFilters.category = category
      newFilters.category_img = img

      // set last selected
      lastSelectedIsNew.category = true

      // update product
      setProduct(product => {
        product.category = category
        product.properties = []
      })
    }} />)
  }

  function categoryHandler() {
    if (lastSelectedIsNew.category) {
      // remove new filter
      setCategories(categories => {
        categories.pop()
      })
      newFilters.category = ''
      newFilters.category_img = ''
    }

    // set last selected
    lastSelectedIsNew.category = false
  }

  function addBrand(setProduct: StateUpdater<Product>) {
    openModal(<InputModal title='Agregar marca' onAccept={brand => {
      const brands = useAppStore.getState().filters.categoryFilters.state.data.brands
      if (brands.includes(brand)) return;

      setCategoryFilters(filters => {
        if (newFilters.brand.length) {
          filters.brands[filters.brands.length - 1] = brand
        } else {
          filters.brands.push(brand)
        }
      })

      newFilters.brand = brand

      lastSelectedIsNew.brand = true

      setProduct(product => {
        product.brand = brand
      })
    }} />)
  }

  function brandHandler() {
    if (lastSelectedIsNew.brand) {
      setCategoryFilters(filters => {
        filters.brands.pop()
      })
      newFilters.brand = ''
    }

    lastSelectedIsNew.brand = false
  }

  function addProperty() {
    openModal(<InputModal title='Agregar característica' onAccept={propertyName => {
      const properties = useAppStore.getState().filters.categoryFilters.state.data.properties
      if (properties.some(p => p.name == propertyName)) return;

      const newProperty = {
        name: propertyName,
        values: []
      }

      setCategoryFilters(filters => {
        filters.properties.push(newProperty)
      })
    }} />)
  }

  function addPropertyValue(propertyName: string, propertyIndexForFilters: number, setProduct: StateUpdater<Product>) {
    openModal(<InputModal title='Agregar valor de característica' onAccept={propertyValue => {
      const values = useAppStore.getState().filters.categoryFilters.state.data.properties[propertyIndexForFilters].values;
      if (values.includes(propertyValue)) return;

      setCategoryFilters(filters => {
        filters.properties[propertyIndexForFilters].values.push(propertyValue)
      })

      const propertyIndexNewFilters = newFilters.properties.findIndex(property => property.name == propertyName)
      const property = newFilters.properties[propertyIndexNewFilters]
      if (property) {
        newFilters.properties[propertyIndexNewFilters] = produce(property, draft => {
          draft.values.push(propertyValue)
        })
      } else {
        newFilters.properties = [{
          name: propertyName,
          values: [propertyValue]
        }]
      }

      setProduct(product => {
        const propertyIndexForProduct = product.properties.findIndex(property => property.name == propertyName)
        if (propertyIndexForProduct == -1) {
          product.properties.push({ name: propertyName, values: [propertyValue] })
        } else {
          product.properties[propertyIndexForProduct].values.push(propertyValue)
        }
      })
    }} />)
  }

  function propertyValueHandler(
    propertyName: string,
    propertyIndexForFilters: number,
    propertyValueIndexForFilters: number,
    e: ChangeEvent<HTMLInputElement>
  ) {
    const
      propertyValue = e.currentTarget.value,
      propertyIndexForNewFilters = newFilters.properties.findIndex(property => property.name == propertyName),
      clickedValueIsNew = newFilters.properties[propertyIndexForNewFilters]?.values.includes(propertyValue),
      isSelected = e.currentTarget.checked

    if (clickedValueIsNew && !isSelected) {
      setCategoryFilters(filters => {
        filters.properties[propertyIndexForFilters].values.splice(propertyValueIndexForFilters, 1)
      })
      const propertyValueIndexForNewFilters = newFilters.properties[propertyIndexForNewFilters].values.indexOf(propertyValue)
      newFilters.properties[propertyIndexForNewFilters].values.splice(propertyValueIndexForNewFilters, 1)
    }
  }

  function addTag(setProduct: StateUpdater<Product>) {
    openModal(<NamedImageModal title='Agregar etiqueta' onAccept={(tag, img) => {
      const tags = useAppStore.getState().filters.tags.state.data
      if (tags.includes(tag)) return;

      setTags(tags => {
        tags.push(tag)
        newFilters.tags.push({
          name: tag,
          imgPath: img
        })
      })

      setProduct(product => {
        product.tags.push(tag)
      })
    }} />)
  }

  function tagHandler(indexForFilters: number, e: ChangeEvent<HTMLInputElement>) {
    const
      tag = e.currentTarget.value,
      indexForNewFilters = newFilters.tags.findIndex(t => t.name == tag),
      isSelected = e.currentTarget.checked,
      isNew = indexForNewFilters != -1;

    if (isNew && !isSelected) {
      setTags(tags => {
        tags.splice(indexForFilters, 1)
        newFilters.tags.splice(indexForNewFilters, 1)
      })
    }
  }

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
    <main className={styles.main}>
      <Loader isLoading={isLoading} meanwhile={<CenteredSpinner />}>
        {initialProduct && <>
          <Formik<Product>
            initialValues={initialProduct}
            validationSchema={productSchema}
            onSubmit={save}
          >
            {({ isSubmitting, errors, values }) => (
              <>
                <Product product={values} userCart={[]} />
                <aside className={styles.editor}>
                  <Form>
                    <Field name='image' component={ImageInput} handler={imageHandler} />
                    <Field name='name' component={Input} label='Nombre' type='text' />
                    <Field name='price.current' component={Input} label='Precio' type='number' handler={priceHandler} />
                    <Field name='note' component={TextArea} label='Nota (opcional)' as='textarea' />

                    <div className={styles.editor__filters}>
                      <CategorySelector selectHandler={categoryHandler} addCategory={addCategory} />
                      <CategoryFiltersSelector
                        category={{ name: values.category, isNew: values.category == newFilters.category }}
                        brandHandler={brandHandler}
                        propertyValueHandler={propertyValueHandler}
                        addBrand={addBrand}
                        addProperty={addProperty}
                        addPropertyValue={addPropertyValue}
                      />
                      <TagSelector selectHandler={tagHandler} addTag={addTag} />
                    </div>

                    <button
                      className={styles.editor__save_btn}
                      type='submit'
                      disabled={isSubmitting}
                    >
                      Guardar
                    </button>
                  </Form>
                </aside>
              </>
            )}
          </Formik>
        </>}
      </Loader>
    </main>
  )
}

interface FormikFieldComponentProps {
  field: {
    name: string
    onChange: ChangeEventHandler
    onBlur: FocusEventHandler
    value: any
  }
  form: FormikContextType<Product>
}

interface ImageInputProps extends FormikFieldComponentProps {
  className?: string
  handler(data: ImageFileData, productUpdater: StateUpdater<Product>): void
}

const ImageInput = ({ field, form, className, handler }: ImageInputProps) => {
  const [isReading, setIsReading] = useState(false)

  const updateProduct: StateUpdater<Product> = updater => {
    form.setValues(produce(updater))
  }

  async function _handler(e: ChangeEvent<HTMLInputElement>) {
    const file = (e.target.files as FileList)[0]
    setIsReading(true)
    const base64Img = await getBase64(file)
    setIsReading(false)
    handler({ base64Img, name: file.name, type: file.type }, updateProduct)
  }

  return <div className={inputStyles.img_input}>
    <label
      htmlFor={field.name}
      className={`${inputStyles.img_input__btn} ${className ? className : ''}`}
      role='button'>
      {isReading ? 'Leyendo imagen' : 'Elige una imagen'}
    </label>
    <input
      id={field.name}
      className={inputStyles.img_input__input}
      type='file'
      accept='image/*'
      onChange={_handler}
    />
    <CustomFormikError name={field.name} />
  </div>
}

interface CustomInputProps extends FormikFieldComponentProps {
  label: string
  type: HTMLInputTypeAttribute
  handler?(e: ChangeEvent<HTMLInputElement>, productUpdater: StateUpdater<Product>): void
}

const Input = ({ field, form, label, handler, ...props }: CustomInputProps) => {
  const updateProduct: StateUpdater<Product> = updater => {
    form.setValues(produce(updater))
  }

  const _handler = (e: ChangeEvent<HTMLInputElement>) => {
    if (handler) handler(e, updateProduct);
    else field.onChange(e)
  };

  return <>
    <label htmlFor={field.name}>{label}</label>
    <input id={field.name} {...field} {...props} onChange={_handler} autoComplete='off' />
    <CustomFormikError name={field.name} />
  </>
}

const TextArea = ({ field, form, label }: CustomInputProps) => {
  return <>
    <label htmlFor={field.name}>{label}</label>
    <textarea id={field.name} {...field} />
    <CustomFormikError name={field.name} />
  </>
}