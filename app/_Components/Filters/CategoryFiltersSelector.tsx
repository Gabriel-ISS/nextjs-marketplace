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
  checkedProperties: FilterForFilters['properties']
}

export default function CategoryFiltersSelector({ category, brandHandler, commonPropertiesHandler, checkedBrands, checkedProperties }: Props) {
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
        {data.brands.length ? (
          <fieldset className={style.filter_group}>
            <legend className={style.filter_group__title}>
              Marcas
            </legend>
            <div className={style.filter_group__options}>
              {data.brands.map(brand => (
                <label className={style.filter_group__option} key={brand}>
                  <input
                    type='checkbox'
                    name='brand'
                    value={brand}
                    id={brand}
                    onChange={brandHandler}
                    checked={checkedBrands.includes(brand)}
                  />{brand}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset className={style['common_properties--no_padding']}>
          {data.properties.map(({ name: propertyName, values }, propertyIndex) => (
            <fieldset className={style.filter_group} key={propertyName}>
              <legend className={style.filter_group__title}>
                {propertyName}
              </legend>
              <div className={style.filter_group__options}>
                {values.map((name, valueIndex) => (
                  <label className={style.filter_group__option} key={name}>
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
                ))}
              </div>
            </fieldset>
          ))}
        </fieldset>
      </>}
    </Loader>
  )
}