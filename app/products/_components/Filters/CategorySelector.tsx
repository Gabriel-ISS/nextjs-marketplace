'use client'

import ErrorBlock from '@/_reusable_components/ErrorBlock'
import styles from '@/products/_components/Filters/Filters.module.scss'
import Loader from '@/_reusable_components/Loader'
import useFetch from '@/_hooks/useFetch'
import useQuery from '@/_hooks/useQuery'
import { getCategories } from '@/_lib/data'


export default function CategorySelector() {
  const [query, setQuery]= useQuery()
  const { error, isLoading, data } = useFetch<string[]>(({ manager }) => manager(() => getCategories()))

  if (error) return <ErrorBlock>{error}</ErrorBlock>

  const filterByCategory = (category: string) => {
    query.category = category
    setQuery(query)
  }

  return (
    <fieldset className={styles.filter_group}>
      <legend className={styles.filter_group__title}>
        Categorías
      </legend>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando categorías...</span>}>
        {data && (
          <div className={styles.filter_group__options}>
            {data.map(category => (
              <label className={styles.filter_group__option} key={category}>
                <input
                  type='radio'
                  name='category'
                  value={category}
                  id={category}
                  onChange={e => filterByCategory(e.target.value)}
                  defaultChecked={category == query.category}
                />
                {category}
              </label>
            ))}
          </div>
        )}
      </Loader>
    </fieldset>
  )
}