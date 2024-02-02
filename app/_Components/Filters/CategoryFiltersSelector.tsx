import ErrorBlock from '@/_Components/ErrorBlock'
import styles from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useFetch from '@/_hooks/useFetch'
import { getCategoryFiltersNC } from '@/_lib/data'
import { ChangeEvent, ChangeEventHandler } from 'react'


interface Props {
  category: {
    name: string,
    isNew: boolean
  }
  brandHandler: ChangeEventHandler<HTMLInputElement>
  commonPropertiesHandler: (propertyName: string, propertyIndexForFilters: number, propertyValueIndexForFilters: number, event: ChangeEvent<HTMLInputElement>) => void
  checkedBrands: string[]
  checkedProperties: FilterForFilters['properties']
}

export default function CategoryFiltersSelector({ category, brandHandler, commonPropertiesHandler, checkedBrands, checkedProperties }: Props) {
  const { isLoading, data, error } = useFetch<FilterForFilters>(
    async ({ manager, setData }) => {
      if (category.isNew) {
        setData(null)
        return
      } else {
        return await manager(() => getCategoryFiltersNC(category.name))
      }
    },
    [category.name]
  )

  if (error) return <ErrorBlock>{error}</ErrorBlock>

  return (
    <Loader isLoading={isLoading} meanwhile={<span>Cargando filtros de categoría...</span>}>
      {data && <>
        {data.brands.length ? (
          <fieldset className={styles.filter_group}>
            <legend className={styles.filter_group__title}>
              Marcas
            </legend>
            <div className={styles.filter_group__options}>
              {data.brands.map(brand => (
                <label className={styles.filter_group__option} key={brand}>
                  <input
                    type='checkbox'
                    name='brand'
                    value={brand}
                    id={brand}
                    onChange={brandHandler}
                    checked={checkedBrands.includes(brand)}
                  />{brand}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset className={styles['common_properties--no_padding']}>
          {data.properties.map(({ name: propertyName, values }, propertyIndex) => (
            <fieldset className={styles.filter_group} key={propertyName}>
              <legend className={styles.filter_group__title}>
                {propertyName}
              </legend>
              <div className={styles.filter_group__options}>
                {values.map((name, valueIndex) => (
                  <label className={styles.filter_group__option} key={name}>
                    {name}
                    <input
                      type='checkbox'
                      name={propertyName}
                      value={name}
                      id={name}
                      onChange={e => commonPropertiesHandler(propertyName, propertyIndex, valueIndex, e)}
                      checked={Boolean(checkedProperties.find(property => property.name == propertyName)?.values.includes(name))}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </fieldset>
      </>}
    </Loader>
  )
}