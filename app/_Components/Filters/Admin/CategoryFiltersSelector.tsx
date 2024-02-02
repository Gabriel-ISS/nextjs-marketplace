import ErrorBlock from '@/_Components/ErrorBlock'
import styles from '@/_Components/Filters/Filters.module.scss'
import { CustomFormikError } from '@/_Components/Inputs'
import Loader from '@/_Components/Loader'
import useThrottleEffect from '@/_hooks/useThrottleEffect'
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
  const { setFieldValue, setValues, values: productValues } = useFormikContext<Product>()
  const { loadCategoryFilters, clearCategoryFilters, state: { error, isLoading, data } } = useAppStore(s => ({
    loadCategoryFilters: s.filters.categoryFilters.load,
    clearCategoryFilters: s.filters.categoryFilters.clear,
    state: s.filters.categoryFilters.state
  }))

  useThrottleEffect(() => {
    if (category.isNew) {
      clearCategoryFilters()
    } else {
      loadCategoryFilters(category.name)
    }
  }, [category.name])

  if (error) return <ErrorBlock className={styles.error}>{error}</ErrorBlock>

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
        <fieldset className={styles.filter_group}>
          <legend className={styles.filter_group__title}>
            Marcas
            <button type='button' className={styles.filter_group__add_btn} onClick={() => addBrand(updateProduct)}>Añadir +</button>
          </legend>
          <CustomFormikError name='brand' />
          <div className={styles.filter_group__options}>
            {data.brands.map(brand => (
              <label className={styles.filter_group__option} key={brand}>
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

        <fieldset className={styles.common_properties}>
          <legend className={styles.common_properties__label}>
            Características únicas
            <button
              type='button'
              className={styles.filter_group__add_btn}
              onClick={addProperty}>
              Añadir +
            </button>
          </legend>
          <CustomFormikError name='properties' />
          <div className={styles.common_properties__container}>

            {data.properties.map(({ name: propertyName, values }, propertyIndex) => (
              <fieldset className={styles.filter_group} key={propertyName}>
                <legend className={styles.filter_group__title}>
                  {propertyName}
                  <button type='button' className={styles.filter_group__add_btn} onClick={() => addPropertyValue(propertyName, propertyIndex, updateProduct)}>Añadir +</button>
                </legend>
                <div className={styles.filter_group__options}>
                  {values.map((name, valueIndex) => (
                    <label className={styles.filter_group__option} key={name}>
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