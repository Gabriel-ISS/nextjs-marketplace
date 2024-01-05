'use client'

import CategoryFiltersSelector from '@/_Components/Filters/CategoryFiltersSelector'
import CategorySelector from '@/_Components/Filters/CategorySelector'
import style from '@/_Components/Filters/Filters.module.scss'
import TagSelector from '@/_Components/Filters/TagSelector'
import useScrollLock from '@/_hooks/useLockScroll'
import useAppStore from '@/_store/useStore'
import { useRouter, useSearchParams } from 'next/navigation'
import QueryString from 'qs'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { FaFilter } from 'react-icons/fa'


export default function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const { lockScroll, unlockScroll } = useScrollLock()
  const { data: query, setter: setQuery, setFromString: setQueryFromString } = useAppStore(s => s.query)
  const checkedProperties: FilterNoCounted['properties'] = useMemo(() => {
    if (!query.properties) return [];
    return Object.entries(query.properties).map(([name, values]) => ({ name, values }))
  }, [query.properties])

  useEffect(() => {
    if (searchParams.size && !Object.keys(query).length) {
      setQueryFromString(searchParams.toString())
    } else {
      router.replace(`/products?${QueryString.stringify(query)}`)
    }
  }, [query])

  function toggleSidebar() {
    if (isOpen) {
      setIsOpen(false)
      unlockScroll()
    } else {
      setIsOpen(true)
      lockScroll()
    }
  }

  function categoryHandler(event: ChangeEvent<HTMLInputElement>) {
    const category = event.currentTarget.value
    setQuery(query => {
      query.category = category
      delete query.brands
      delete query.properties
    })
  }

  function arrayQueryHandler<T>(parent: T, arrayContainerKey: keyof T, value: string, isChecked: boolean) {
    const array = parent[arrayContainerKey] as string[]

    function removeFromQuery() {
      const index = array.indexOf(value)
      if (array.length == 1) {
        delete parent[arrayContainerKey]
      } else {
        array.splice(index, 1)
      }
    }

    function addToQuery() {
      if (array) {
        array.push(value)
      } else {
        parent[arrayContainerKey] = [value] as T[keyof T]
      }
    }

    if (isChecked) {
      addToQuery()
    } else {
      removeFromQuery()
    }
  }

  function brandHandler(event: ChangeEvent<HTMLInputElement>) {
    const brand = event.currentTarget.value
    const isChecked = event.currentTarget.checked
    setQuery(query => {
      arrayQueryHandler(query, 'brands', brand, isChecked)
    })
  }

  function propertyHandler(propertyName: string, _PIFF: number, _PVIFF: number, event: ChangeEvent<HTMLInputElement>) {
    const propertyValue = event.currentTarget.value
    const isChecked = event.currentTarget.checked
    setQuery(query => {
      const properties = query.properties || {}
      arrayQueryHandler(properties, propertyName, propertyValue, isChecked)
      query.properties = properties
    })
  }

  function tagHandler(_IFF: number, event: ChangeEvent<HTMLInputElement>) {
    const tag = event.currentTarget.value
    const isChecked = event.currentTarget.checked
    setQuery(query => {
      arrayQueryHandler(query, 'tags', tag, isChecked)
    })
  }

  return (
    <aside className={style.filters} data-state={isOpen ? "opened" : "closed"}>

      <CategorySelector checked={query.category || ''} selectHandler={categoryHandler} />
      <CategoryFiltersSelector
        category={{
          name: query.category || '',
          isNew: !query.category
        }}
        checkedBrands={query.brands || []}
        checkedProperties={checkedProperties}
        brandHandler={brandHandler}
        commonPropertiesHandler={propertyHandler}
      />
      <TagSelector checked={query.tags || []} selectHandler={tagHandler} />

      <button className={style.filters__toggle_btn} onClick={toggleSidebar}>
        {isOpen ? <IoMdClose size='100%' /> : <FaFilter size='70%' />}
      </button>

    </aside>
  )
}