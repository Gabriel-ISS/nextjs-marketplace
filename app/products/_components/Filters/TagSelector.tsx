import ErrorBlock from '@/_reusable_components/ErrorBlock'
import styles from '@/products/_components/Filters/Filters.module.scss'
import Loader from '@/_reusable_components/Loader'
import useFetch from '@/_hooks/useFetch'
import useQuery from '@/_hooks/useQuery'
import { getProductGroups } from '@/_lib/data'
import { checkboxManager } from '@/_lib/utils'


export default function TagSelector() {
  const [query, setQuery] = useQuery()
  const { error, isLoading, data } = useFetch<string[]>(({ manager }) => manager(() => getProductGroups({NC: true})))

  if (error) return <ErrorBlock>{error}</ErrorBlock>

  const selectHandler = (selected: string, isChecked: boolean) => {
    checkboxManager(query, 'tags', selected, isChecked)
    setQuery(query)
  }

  return (
    <fieldset className={styles.filter_group}>
      <legend className={styles.filter_group__title}>
        Etiquetas
      </legend>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando etiquetas...</span>}>
        {data && (
          <div className={styles.filter_group__options}>
            {data.map(tag => (
              <label className={styles.filter_group__option} key={tag}>
                <input
                  type='checkbox'
                  name='category'
                  value={tag}
                  id={tag}
                  onChange={e => selectHandler(e.target.value, e.target.checked)}
                  defaultChecked={query.tags?.includes(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        )}
      </Loader>
    </fieldset>
  )
}