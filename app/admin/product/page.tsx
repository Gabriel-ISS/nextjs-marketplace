'use client'


import CategoryFiltersSelector from '@/_Components/Filters/CategoryFiltersSelector'
import CategorySelector from '@/_Components/Filters/CategorySelector'
import TagSelector from '@/_Components/Filters/TagSelector'
import { ImageFileData, ImageInput, Input } from '@/_Components/Inputs'
import Loader from '@/_Components/Loader'
import CropImageModal from '@/_Components/Modal/CropImageModal'
import InputModal from '@/_Components/Modal/InputModal'
import MessageModal from '@/_Components/Modal/MessageModal'
import TagModal from '@/_Components/Modal/TagModal'
import Product from '@/_Components/Product'
import useLoadState from '@/_hooks/useLoadState'
import { saveProduct } from '@/_lib/actions'
import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { getProduct } from '@/_lib/data'
import useAppStore from '@/_store/useStore'
import style from '@/admin/product/page.module.scss'
import { produce } from 'immer'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'


let newFilters: NewFilters = {
  category: '',
  brand: '',
  commonProperties: [],
  tags: []
}

// solo para inputs tipo radio
let lastSelectedIsNew = {
  category: false,
  brand: false
}


export default function ({ searchParams }: PageProps) {
  const router = useRouter()
  const { openModal, setCategories, setCategoryFilters, setTags } = useAppStore(s => ({
    openModal: s.modal.open,
    setCategories: s.filters.categories.setter,
    setCategoryFilters: s.filters.categoryFilters.setter,
    setTags: s.filters.tags.setter
  }))
  const [product, setProduct, isLoading, _setLoading] = useLoadState<Product>(DEFAULT_PRODUCT)
  const [currentCategory, setCurrentCategory] = useState({
    name: '',
    isNew: true
  })
  const [originalPrice, setOriginalPrice] = useState(0)


  useEffect(() => {
    (async () => {
      try {
        const product = await getProduct(searchParams.id)
        setProduct(() => product)
        setCurrentCategory({
          name: product.category,
          isNew: product.category == ''
        })
        setOriginalPrice(product.price.current)
        newFilters = { category: '', brand: '', commonProperties: [], tags: [] }
        lastSelectedIsNew = { category: false, brand: false }
      } catch (error) {
        alert('Error al obtener productos')
      }
    })()
  }, [])

  function imageHandler(data: ImageFileData) {
    openModal(<CropImageModal imageData={data} onSaveCrop={croppedImage => {
      setProduct(product => {
        product.image = croppedImage
      })
    }} />)
  }

  function textHandler(name: string, value: string) {
    setProduct(product => {
      product[name as 'name' | 'note'] = value
    })
  }

  function priceHandler(_name: string, value: string) {
    setProduct(product => {
      const newPrice = parseInt(value) || 0
      if (originalPrice > newPrice) {
        product.price.old = originalPrice
      }
      product.price.current = newPrice
    })
  }

  function addCategory() {
    openModal(<InputModal title='Agregar categoría' onAccept={category => {
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

      // set last selected
      lastSelectedIsNew.category = true

      // update product
      setProduct(product => {
        product.category = category
        product.properties = []
      })

      setCurrentCategory({
        name: category,
        isNew: true
      })
    }} />)
  }

  function categoryHandler(e: ChangeEvent<HTMLInputElement>) {
    const category = e.target.value

    if (lastSelectedIsNew.category) {
      // remove new filter
      setCategories(categories => {
        categories.pop()
      })
      newFilters.category = ''
    }

    // set last selected
    lastSelectedIsNew.category = false

    // update product
    setProduct(product => {
      product.category = category
    })

    // extra: set current category
    setCurrentCategory({
      name: category,
      isNew: false
    })
  }

  function addBrand() {
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

  function brandHandler(e: ChangeEvent<HTMLInputElement>) {
    const brand = e.target.value

    if (lastSelectedIsNew.brand) {
      setCategoryFilters(filters => {
        filters.brands.pop()
      })
      newFilters.brand = ''
    }

    lastSelectedIsNew.brand = false

    setProduct(product => {
      product.brand = brand
    })
  }

  function addProperty() {
    openModal(<InputModal title='Agregar característica' onAccept={propertyName => {
      const properties = useAppStore.getState().filters.categoryFilters.state.data.commonProperties
      if (properties.some(p => p.name == propertyName)) return;

      const newProperty = {
        name: propertyName,
        values: []
      }

      setCategoryFilters(filters => {
        filters.commonProperties.push(newProperty)
        newFilters.commonProperties.push(newProperty)
      })

      setProduct(product => {
        product.properties.push(newProperty)
      })
    }} />)
  }

  function addPropertyValue(propertyName: string, propertyIndexForFilters: number) {
    openModal(<InputModal title='Agregar valor de característica' onAccept={propertyValue => {
      const values = useAppStore.getState().filters.categoryFilters.state.data.commonProperties[propertyIndexForFilters].values;
      if (values.includes(propertyValue)) return;

      setCategoryFilters(filters => {
        filters.commonProperties[propertyIndexForFilters].values.push(propertyValue)
      })

      const propertyIndexNewFilters = newFilters.commonProperties.findIndex(property => property.name == propertyName)
      const property = newFilters.commonProperties[propertyIndexNewFilters]
      if (property) {
        newFilters.commonProperties[propertyIndexNewFilters] = produce(property, draft => {
          draft.values.push(propertyValue)
        })
      } else {
        newFilters.commonProperties = [{
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
      propertyIndexForNewFilters = newFilters.commonProperties.findIndex(property => property.name == propertyName),
      propertyIndexForProduct = product.properties.findIndex(property => property.name == propertyName),
      clickedValueIsNew = newFilters.commonProperties[propertyIndexForNewFilters]?.values.includes(propertyValue),
      isSelected = !product.properties[propertyIndexForProduct]?.values.includes(propertyValue)

    if (clickedValueIsNew && !isSelected) {
      setCategoryFilters(filters => {
        filters.commonProperties[propertyIndexForFilters].values.splice(propertyValueIndexForFilters, 1)
      })
      console.log(newFilters)
      const propertyValueIndexForNewFilters = newFilters.commonProperties[propertyIndexForNewFilters].values.indexOf(propertyValue)
      newFilters.commonProperties[propertyIndexForNewFilters].values.splice(propertyValueIndexForNewFilters, 1)
    }

    setProduct(product => {
      const
        properties = product.properties,
        currentProperty = properties[propertyIndexForProduct] as Product['properties'][number] | undefined,
        propertyValues = currentProperty?.values;

      if (isSelected) {
        if (propertyValues) {
          propertyValues.push(propertyValue)
        } else {
          properties.push({
            name: propertyName,
            values: [propertyValue]
          })
        }
      } else {
        if (!propertyValues) throw new Error('Se esta deseleccionando un valor de una propiedad que no se encuentra');
        if (propertyValues.length > 1) {
          const propertyValueIndexForProduct = propertyValues.indexOf(propertyValue)
          propertyValues.splice(propertyValueIndexForProduct, 1)
        } else {
          properties.splice(propertyIndexForProduct, 1)

        }
      }
    })
  }

  function addTag() {
    openModal(<TagModal title='Agregar etiqueta' onAccept={(tag, img) => {
      const tags = useAppStore.getState().filters.tags.state.data
      if (tags.includes(tag)) return;

      setTags(tags => {
        tags.push(tag)
        newFilters.tags.push({
          name: tag,
          image: img
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
      indexForProduct = product.tags.indexOf(tag),
      indexForNewFilters = newFilters.tags.findIndex(t => t.name == tag),
      isSelected = indexForProduct == -1,
      isNew = indexForNewFilters != -1;

    if (isNew && !isSelected) {
      setTags(tags => {
        tags.splice(indexForFilters, 1)
        newFilters.tags.splice(indexForNewFilters, 1)
      })
    }

    setProduct(product => {
      if (isSelected) {
        product.tags.push(tag)
      } else {
        product.tags.splice(indexForProduct, 1)
      }
    })
  }

  async function save() {
    try {
      const finalProduct = produce(product, p => {
        if (originalPrice > p.price.current) {
          p.price.old = originalPrice
        }
        p.properties = p.properties.filter(property => property.values.length)
      })
      const message = await saveProduct(finalProduct, newFilters)
      openModal(<MessageModal title='Éxito' message={message} onAccept={() => router.push('/products')} />, 'green')
    } catch (error: any) {
      openModal(<MessageModal title='Error' message={error.message} />, 'red')
    }
  }

  return (
    <main className={style.main}>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando producto...</span>}>
        {product && <Product product={product} />}
      </Loader>
      <aside className={style.editor}>
        <ImageInput handler={imageHandler} />
        <Input label='Nombre' field='name' value={product.name} handler={textHandler} />
        <Input label='Precio' field='price' value={product.price.current} handler={priceHandler} inputType='number' />
        <Input label='Nota (opcional)' field='note' value={product.note || ''} handler={textHandler} as='textarea' />
        <div className={style.editor__filters}>
          <CategorySelector
            selectHandler={categoryHandler}
            checked={product.category}
            editor={{ addCategory }}
          />
          <CategoryFiltersSelector
            checkedBrands={[product.brand]}
            checkedProperties={product.properties}
            editor={{ addBrand, addProperty, addPropertyValue }}
            category={currentCategory}
            brandHandler={brandHandler}
            commonPropertiesHandler={propertyValueHandler}
          />
          <TagSelector
            checked={product.tags}
            editor={{ addTag }}
            selectHandler={tagHandler}
          />
        </div>
        <button className={style.editor__save_btn} onClick={save}>Guardar</button>
      </aside>
    </main>
  )
}