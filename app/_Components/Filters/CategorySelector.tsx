import ErrorBlock from '@/_Components/ErrorBlock'
import styles from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useFetch from '@/_hooks/useFetch'
import { getCategories } from '@/_lib/data'
import useAppStore from '@/_store/useStore'
import { ChangeEventHandler, useEffect, useState } from 'react'


interface Props {
  selectHandler: ChangeEventHandler<HTMLInputElement>
  checked: string
}

export default function CategorySelector({ selectHandler, checked }: Props) {
  const { error, isLoading, data } = useFetch<string[]>(({ manager }) => manager(() => getCategories()))

  if (error) return <ErrorBlock>{error}</ErrorBlock>

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
                  onChange={selectHandler}
                  checked={category == checked}
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