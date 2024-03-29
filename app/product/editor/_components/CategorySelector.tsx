import ErrorBlock from '@/_reusable_components/ErrorBlock'
import styles from '@/products/_components/Filters/Filters.module.scss'
import { CustomFormikError } from '@/_reusable_components/Inputs'
import Loader from '@/_reusable_components/Loader'
import useFetch from '@/_hooks/useFetch'
import useThrottleEffect from '@/_hooks/useThrottleEffect'
import { StateUpdater } from '@/_hooks/useWritableState'
import useAppStore from '@/_store/useStore'
import { Field, useFormikContext } from 'formik'
import { produce } from 'immer'
import { ChangeEvent, useEffect } from 'react'


interface Props {
  selectHandler(): void
  addCategory(updateProduct: StateUpdater<Product>): void
}

export default function CategorySelector({ selectHandler, addCategory }: Props) {
  const { setFieldValue, setValues } = useFormikContext()
  const { loadCategories, state: { error, isLoading, data } } = useAppStore(s => ({
    loadCategories: s.filters.categories.load,
    setCategories: s.filters.categories.setter,
    state: s.filters.categories.state
  }))

  useThrottleEffect(loadCategories, [])

  if (error) return <ErrorBlock className={styles.error}>{error}</ErrorBlock>

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
    <fieldset className={styles.filter_group}>
      <legend className={styles.filter_group__title}>
        Categorías
        <button type='button' className={styles.filter_group__add_btn} onClick={() => addCategory(updateProduct)}>Añadir +</button>
      </legend>
      <CustomFormikError name='category' />
      <Loader isLoading={isLoading} meanwhile={<span>Cargando categorías...</span>}>
        {data && (
          <div className={styles.filter_group__options}>
            {data.map(category => (
              <label className={styles.filter_group__option} key={category}>
                <Field type='radio' name='category' value={category} onChange={categoryHandler} />
                {category}
              </label>
            ))}
          </div>
        )}
      </Loader>
    </fieldset>
  )
}