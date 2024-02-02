import ErrorBlock from '@/_Components/ErrorBlock'
import styles from '@/_Components/Filters/Filters.module.scss'
import { CustomFormikError } from '@/_Components/Inputs'
import Loader from '@/_Components/Loader'
import useThrottleEffect from '@/_hooks/useThrottleEffect'
import { StateUpdater } from '@/_hooks/useWritableState'
import useAppStore from '@/_store/useStore'
import { Field, useFormikContext } from 'formik'
import { produce } from 'immer'
import { ChangeEvent } from 'react'


interface Props {
  selectHandler(indexForFilters: number, e: ChangeEvent<HTMLInputElement>): void
  addTag(updateProduct: StateUpdater<Product>): void
}

export default function TagSelector({ selectHandler, addTag }: Props) {
  const { setValues } = useFormikContext<Product>()
  const { loadTags, state: { error, isLoading, data } } = useAppStore(s => ({
    loadTags: s.filters.tags.load,
    state: s.filters.tags.state
  }))

  useThrottleEffect(loadTags, [])

  if (error) return <ErrorBlock className={styles.error}>{error}</ErrorBlock>

  const updateProduct: StateUpdater<Product> = updater => {
    setValues(produce(draft => {
      updater(draft)
    }))
  }

  function tagHandler(index: number, e: ChangeEvent<HTMLInputElement>) {
    const isChecked = e.currentTarget.checked
    const tag = e.currentTarget.value
    setValues(produce(product => {
      if (isChecked) {
        product.tags.push(tag)
      } else {
        const index = product.tags.indexOf(tag)
        product.tags.splice(index, 1)
      }
    }));
    selectHandler(index, e)
  }

  return (
    <fieldset className={styles.filter_group}>
      <legend className={styles.filter_group__title}>
        Etiquetas
        <button type='button' className={styles.filter_group__add_btn} onClick={() => addTag(updateProduct)}>Añadir +</button>
      </legend>
      <CustomFormikError name='tags' />
      <Loader isLoading={isLoading} meanwhile={<span>Cargando etiquetas...</span>}>
        {data && (
          <div className={styles.filter_group__options}>
            {data.map((tag, i) => (
              <label className={styles.filter_group__option} key={tag}>
                <Field type='checkbox' name='tags' value={tag} onChange={(e: ChangeEvent<HTMLInputElement>) => tagHandler(i, e)} />
                {tag}
              </label>
            ))}
          </div>
        )}
      </Loader>
    </fieldset>
  )
}