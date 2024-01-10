import style from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useAppStore from '@/_store/useStore'
import { ChangeEventHandler, useEffect, useState } from 'react'


interface Props {
  selectHandler: ChangeEventHandler<HTMLInputElement>
  checked: string
}

export default function CategorySelector({ selectHandler, checked }: Props) {
  const { loadCategories, state: { data, isLoading } } = useAppStore(s => ({
    loadCategories: s.filters.categories.load,
    state: s.filters.categories.state
  }))

  useEffect(loadCategories, [])

  return (
    <fieldset className={style.filter_group}>
      <legend className={style.filter_group__title}>
        Categorías
      </legend>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando categorías...</span>}>
        {data && (
          <div className={style.filter_group__options}>
            {data.map(category => (
              <div className={style.filter_group__option} key={category}>
                <label>
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
              </div>
            ))}
          </div>
        )}
      </Loader>
    </fieldset>
  )
}