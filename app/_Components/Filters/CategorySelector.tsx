import style from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useAppStore from '@/_store/useStore'
import { ChangeEventHandler, useEffect, useState } from 'react'


interface Props {
  selectHandler: ChangeEventHandler<HTMLInputElement>
  checked: string
  editor?: {
    addCategory: () => void
  }
}

export default function CategorySelector({ selectHandler, checked, editor }: Props) {
  const { loadCategories, state: { data, isLoading } } = useAppStore(s => ({
    loadCategories: s.filters.categories.load,
    state: s.filters.categories.state
  }))

  useEffect(loadCategories, [])

  return (
    <Loader isLoading={isLoading} meanwhile={<span>Cargando categorías...</span>}>
      {data && (
        <fieldset className={style.filter_group}>
          <legend className={style.filter_group__title}>
            Categorías
            {editor && (
              <button className={style.filter_group__add_btn} onClick={editor.addCategory}>Añadir +</button>
            )}
          </legend>
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
        </fieldset>
      )}
    </Loader>
  )
}