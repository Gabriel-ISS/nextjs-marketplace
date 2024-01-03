import style from '@/_Components/Filters/Filters.module.scss'
import Loader from '@/_Components/Loader'
import useAppStore from '@/_store/useStore'
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from 'react'


interface Props {
  category: {
    name: string,
    isNew: boolean
  }
  brandHandler: ChangeEventHandler<HTMLInputElement>
  commonPropertiesHandler: (propertyName: string, propertyIndexForFilters: number, propertyValueIndexForFilters: number, event: ChangeEvent<HTMLInputElement>) => void
  checkedBrands: string[]
  checkedProperties: FilterNoCounted['properties']
  editor?: {
    addBrand: () => void
    addProperty: () => void
    addPropertyValue: (propertyName: string, propertyIndex: number) => void
  }
}

export default function CategoryFiltersSelector({ category, brandHandler, commonPropertiesHandler, checkedBrands, checkedProperties, editor }: Props) {
  const { loadCategoryFilters, clearCategoryFilters, state: { data, isLoading } } = useAppStore(s => ({
    loadCategoryFilters: s.filters.categoryFilters.load,
    clearCategoryFilters: s.filters.categoryFilters.clear,
    state: s.filters.categoryFilters.state
  }))

  useEffect(() => {
    if (category.isNew) {
      clearCategoryFilters()
    } else {
      loadCategoryFilters(category.name)
    }
  }, [category.name])

  return (
    <Loader isLoading={isLoading} meanwhile={<span>Cargando filtros de categoría...</span>}>
      {data && <>
        <fieldset className={style.filter_group}>
          <legend className={style.filter_group__title}>
            Marcas
            {editor && (
              <button className={style.filter_group__add_btn} onClick={editor.addBrand}>Añadir +</button>
            )}
          </legend>
          <div className={style.filter_group__options}>
            {data.brands.map(brand => (
              <div className={style.filter_group__option} key={brand}>
                <label>
                  <input
                    type={editor ? 'radio' : 'checkbox'}
                    name='brand'
                    value={brand}
                    id={brand}
                    onChange={brandHandler}
                    checked={checkedBrands.includes(brand)}
                  />{brand}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className={style.common_properties}>
          {editor &&
            <legend className={style.common_properties__label}>
              Características únicas
              <button
                className={style.filter_group__add_btn}
                onClick={editor.addProperty}>
                Añadir +
              </button>
            </legend>
          }
          <div className={editor ? style.common_properties__container : undefined}>
            {data.properties.map(({ name: propertyName, values }, propertyIndex) => (
              <fieldset className={style.filter_group} key={propertyName}>
                <legend className={style.filter_group__title}>
                  {propertyName}
                  {editor && (
                    <button className={style.filter_group__add_btn} onClick={() => editor.addPropertyValue(propertyName, propertyIndex)}>Añadir +</button>
                  )}
                </legend>
                <div className={style.filter_group__options}>
                  {values.map((name, valueIndex) => (
                    <div className={style.filter_group__option} key={name}>
                      <label>
                        {name}
                        <input
                          type='checkbox'
                          name={propertyName}
                          value={name}
                          id={name}
                          onChange={e => commonPropertiesHandler(propertyName, propertyIndex, valueIndex, e)}
                          checked={Boolean(checkedProperties.find(property => property.name == propertyName)?.values.includes(name))}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </fieldset>
      </>}
    </Loader>
  )
}