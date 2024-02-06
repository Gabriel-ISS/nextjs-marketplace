import ErrorBlock from '@/_Components/ErrorBlock'
import styles from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useFetch from '@/_hooks/useFetch'
import useQuery from '@/_hooks/useQuery'
import { getCategoryFilters } from '@/_lib/data'
import { checkboxManager } from '@/_lib/utils'


export default function CategoryFiltersSelector() {
  const [query, setQuery] = useQuery()
  const { isLoading, data, error } = useFetch<FilterForFilters>(
    async ({ manager, setData }) => {
      if (query.category) {
        return await manager(() => getCategoryFilters(query.category as string))
      } else {
        setData(null)
        return
      }
    },
    [query.category]
  )
  if (error) return <ErrorBlock>{error}</ErrorBlock>

  const brandHandler = (selected: string, isChecked: boolean) => {
    checkboxManager(query, 'brands', selected, isChecked)
    setQuery(query)
  }

  const commonPropertiesHandler = (propertyName: string, selected: string, isChecked: boolean) => {
    if (query.properties) {
      checkboxManager(query.properties, propertyName, selected, isChecked)
      if (!Object.keys(query.properties).length) {
        delete query.properties
      }
    } else {
      query.properties = {
        [propertyName]: [selected]
      }
    }
    setQuery(query)
  }

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
                    onChange={e => brandHandler(e.target.value, e.target.checked)}
                    defaultChecked={query.brands?.includes(brand)}
                  />{brand}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset className={styles['common_properties--no_padding']}>
          {data.properties.map(({ name: propertyName, values }) => (
            <fieldset className={styles.filter_group} key={propertyName}>
              <legend className={styles.filter_group__title}>
                {propertyName}
              </legend>
              <div className={styles.filter_group__options}>
                {values.map(name => (
                  <label className={styles.filter_group__option} key={name}>
                    {name}
                    <input
                      type='checkbox'
                      name={propertyName}
                      value={name}
                      id={name}
                      onChange={e => commonPropertiesHandler(propertyName, e.target.value, e.target.checked)}
                      defaultChecked={Boolean(query.properties?.[propertyName]?.includes(name))}
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