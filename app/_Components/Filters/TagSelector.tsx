import style from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useAppStore from '@/_store/useStore'
import { ChangeEvent, useEffect } from 'react'


interface Props {
  selectHandler: (indexForFilters: number, e: ChangeEvent<HTMLInputElement>) => void
  checked: string[]
}

export default function TagSelector({ selectHandler, checked }: Props) {
  const { loadTags, state: { data, isLoading } } = useAppStore(s => ({
    loadTags: s.filters.tags.load,
    state: s.filters.tags.state
  }))

  useEffect(loadTags, [])

  return (
    <fieldset className={style.filter_group}>
      <legend className={style.filter_group__title}>
        Etiquetas
      </legend>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando etiquetas...</span>}>
        {data && (
          <div className={style.filter_group__options}>
            {data.map((tag, i) => (
              <label className={style.filter_group__option} key={tag}>
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