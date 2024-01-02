import style from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useAppStore from '@/_store/useStore'
import { ChangeEvent, useEffect, useState } from 'react'


interface Props {
  selectHandler: (indexForFilters: number, e: ChangeEvent<HTMLInputElement>) => void
  checked: string[]
  editor?: {
    addTag: () => void
  }
}

export default function TagSelector({ selectHandler, checked, editor }: Props) {
  const { loadTags, state: { data, isLoading } } = useAppStore(s => ({
    loadTags: s.filters.tags.load,
    state: s.filters.tags.state
  }))

  useEffect(loadTags, [])

  return (
    <Loader isLoading={isLoading} meanwhile={<span>Cargando etiquetas...</span>}>
      {data && (
        <fieldset className={style.filter_group}>
          <legend className={style.filter_group__title}>
            Etiquetas
            {editor && (
              <button className={style.filter_group__add_btn} onClick={editor.addTag}>Añadir +</button>
            )}
          </legend>
          <div className={style.filter_group__options}>
            {data.map((tag, i) => (
              <div className={style.filter_group__option} key={tag}>
                <label>
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
              </div>
            ))}
          </div>
        </fieldset>
      )}
    </Loader>
  )
}