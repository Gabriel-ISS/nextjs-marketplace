import style from '@/_Components/Filters/Filters.module.scss'
import { CustomFormikError } from '@/_Components/Inputs'
import Loader from '@/_Components/Loader'
import { StateUpdater } from '@/_hooks/useWritableState'
import useAppStore from '@/_store/useStore'
import { Field, useFormikContext } from 'formik'
import { produce } from 'immer'
import { ChangeEvent, useEffect } from 'react'


interface Props {
  category: {
    name: string,
    isNew: boolean
  }
  addBrand(updateProduct: StateUpdater<Product>): void
  addProperty(): void
  addPropertyValue(propertyName: string, propertyIndex: number, updateProduct: StateUpdater<Product>): void
  brandHandler(): void
  propertyValueHandler(propertyName: string, propertyIndexForFilters: number, propertyValueIndexForFilters: number, event: ChangeEvent<HTMLInputElement>): void
}

export default function CategoryFiltersSelector({ category, brandHandler, propertyValueHandler, addBrand, addProperty, addPropertyValue }: Props) {
  const { setFieldValue, setValues, values: productValues, errors } = useFormikContext<Product>()
  const { loadCategoryFilters, clearCategoryFilters, state: { data, isLoading } } = useAppStore(s => ({
    loadCategoryFilters: s.filters.categoryFilters.load,
    clearCategoryFilters: s.filters.categoryFilters.clear,
    state: s.filters.categoryFilters.state
  }))

  useEffect(() => {
    if (category.isNew) {
      clearCategoryFilters()
    } else {
      loadCategoryFilters(category.name)
    }
  }, [category.name])

  const updateProduct: StateUpdater<Product> = updater => {
    setValues(produce(draft => {
      updater(draft)
    }))
  }

  function _brandHandler(e: ChangeEvent<HTMLInputElement>) {
    setFieldValue(e.currentTarget.name, e.currentTarget.value)
    brandHandler()
  }

  function _propertyValueHandler(propertyName: string, propertyIndex: number, propertyValueIndex: number, e: ChangeEvent<HTMLInputElement>) {
    const isChecked = e.currentTarget.checked
    const value = e.currentTarget.value

    setValues(produce(product => {
      const
        properties = product.properties,
        property = properties.find(p => p.name == propertyName)
      if (isChecked) {
        if (property) {
          property.values.push(value)
        } else {
          properties.push({
            name: propertyName,
            values: [value]
          })
        }
      } else {
        if (!property) throw new Error('No se puede eliminar una propiedad que no existe')
        if (property.values.length > 1) {
          const productPropertyValueIndex = property.values.indexOf(propertyName)
          property.values.splice(productPropertyValueIndex, 1)
        } else {
          const productPropertyIndex = properties.findIndex(p => p.name == propertyName)
          properties.splice(productPropertyIndex, 1)
        }
      }
    }))

    propertyValueHandler(propertyName, propertyIndex, propertyValueIndex, e)
  }

  return (
    <Loader isLoading={isLoading} meanwhile={<span>Cargando filtros de categoría...</span>}>
      {data && category.name.length > 0 && <>
        <fieldset className={style.filter_group}>
          <legend className={style.filter_group__title}>
            Marcas
            <button type='button' className={style.filter_group__add_btn} onClick={() => addBrand(updateProduct)}>Añadir +</button>
          </legend>
          <CustomFormikError name='brand' />
          <div className={style.filter_group__options}>
            {data.brands.map(brand => (
              <label className={style.filter_group__option} key={brand}>
                <Field
                  type='radio'
                  name='brand'
                  value={brand}
                  onChange={_brandHandler}
                />
                {brand}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={style.common_properties}>
          <legend className={style.common_properties__label}>
            Características únicas
            <button
              type='button'
              className={style.filter_group__add_btn}
              onClick={addProperty}>
              Añadir +
            </button>
          </legend>
          <CustomFormikError name='properties' />
          <div className={style.common_properties__container}>

            {data.properties.map(({ name: propertyName, values }, propertyIndex) => (
              <fieldset className={style.filter_group} key={propertyName}>
                <legend className={style.filter_group__title}>
                  {propertyName}
                  <button type='button' className={style.filter_group__add_btn} onClick={() => addPropertyValue(propertyName, propertyIndex, updateProduct)}>Añadir +</button>
                </legend>
                <div className={style.filter_group__options}>
                  {values.map((name, valueIndex) => (
                    <label className={style.filter_group__option} key={name}>
                      {name}
                      <Field
                        type='checkbox'
                        name={`properties[${propertyIndex}].values`}
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => _propertyValueHandler(propertyName, propertyIndex, valueIndex, e)}
                        checked={Boolean(productValues.properties.find(p => p.name == propertyName)?.values.includes(name))}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </fieldset>
      </>}
    </Loader>
  )
}