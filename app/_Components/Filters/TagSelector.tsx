import ErrorBlock from '@/_Components/ErrorBlock'
import styles from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useFetch from '@/_hooks/useFetch'
import { getProductGroupsNC } from '@/_lib/data'
import { ChangeEvent } from 'react'


interface Props {
  selectHandler: (indexForFilters: number, e: ChangeEvent<HTMLInputElement>) => void
  checked: string[]
}

export default function TagSelector({ selectHandler, checked }: Props) {
  const { error, isLoading, data } = useFetch<string[]>(({ manager }) => manager(() => getProductGroupsNC()))

  if (error) return <ErrorBlock>{error}</ErrorBlock>

  return (
    <fieldset className={styles.filter_group}>
      <legend className={styles.filter_group__title}>
        Etiquetas
      </legend>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando etiquetas...</span>}>
        {data && (
          <div className={styles.filter_group__options}>
            {data.map((tag, i) => (
              <label className={styles.filter_group__option} key={tag}>
                <input
                  type='checkbox'
                  name='category'
                  value={tag}
                  id={tag}
                  onChange={e => selectHandler(i, e)}
                  checked={Boolean(checked.includes(tag))}
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