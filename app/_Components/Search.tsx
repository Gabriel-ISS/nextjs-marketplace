'use client'


import style from '@/_Components/Search.module.scss'
import useAppStore from '@/_store/useStore'
import { usePathname, useRouter } from 'next/navigation'
import QueryString from 'qs'
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'


interface Props {
  className?: string
}

export default function Search({ className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState(() => {
    return useAppStore.getState().query.data.search || ''
  })
  const searchQuery = useAppStore(s => s.query.data.search)
  const setQuery = useAppStore(s => s.query.setter)

  function setSearchInQuery(search: string) {
    setQuery(query => {
      if (search.length) {
        query.search = search
      } else {
        delete query.search
      }
    })
    if (pathname == '/' && search != '') {
      const query = useAppStore.getState().query.data
      router.push(`/products?${QueryString.stringify(query)}`)
    }
  }

  useEffect(() => {
    if (!searchQuery) return;
    setSearch(searchQuery)
  }, [searchQuery])

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.currentTarget.value)
  }

  
  function handleClick() {
    setSearchInQuery(search)
  }

  function handleEnter(e: KeyboardEvent) {
    if (e.key == 'Enter') {
      setSearchInQuery(search)
    }
  }

  return (
    <div className={`${style.search} ${className || ''}`}>
      <input className={style.search__input} type="text" name="search" value={search} placeholder="Buscar productos en PC Click" onChange={handleInput} onKeyDown={handleEnter} />
      <button className={style.search__btn} onClick={handleClick}><FaSearch size='100%' /></button>
    </div>
  )
}