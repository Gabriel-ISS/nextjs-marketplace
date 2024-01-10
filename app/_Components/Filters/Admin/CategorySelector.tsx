import style from '@/_Components/Filters/Filters.module.scss'
import { CustomFormikError } from '@/_Components/Inputs'
import Loader from '@/_Components/Loader'
import { StateUpdater } from '@/_hooks/useWritableState'
import useAppStore from '@/_store/useStore'
import { Field, useFormikContext } from 'formik'
import { produce } from 'immer'
import { ChangeEvent, ChangeEventHandler, useEffect } from 'react'


interface Props {
  selectHandler(): void
  addCategory(updateProduct: StateUpdater<Product>): void
}

export default function CategorySelector({ selectHandler, addCategory }: Props) {
  const { setFieldValue, setValues } = useFormikContext()
  const { loadCategories, state: { data, isLoading } } = useAppStore(s => ({
    loadCategories: s.filters.categories.load,
    state: s.filters.categories.state
  }))

  useEffect(loadCategories, [])

  const updateProduct: StateUpdater<Product> = updater => {
    setValues(produce(draft => {
      updater(draft)
    }))
  }

  function categoryHandler(e: ChangeEvent<HTMLInputElement>) {
    setFieldValue(e.currentTarget.name, e.currentTarget.value)
    selectHandler()
  }

  return (
    <fieldset className={style.filter_group}>
      <legend className={style.filter_group__title}>
        Categorías
        <button type='button' className={style.filter_group__add_btn} onClick={() => addCategory(updateProduct)}>Añadir +</button>
      </legend>
      <CustomFormikError name='category'/>
      <Loader isLoading={isLoading} meanwhile={<span>Cargando categorías...</span>}>
        {data && (
          <div className={style.filter_group__options}>
            {data.map(category => (
              <div className={style.filter_group__option} key={category}>
                <label>
                  <Field type='radio' name='category' value={category} onChange={categoryHandler} />
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