'use client'

import styles from '@/_Components/Search.module.scss'
import { getQueryObj } from '@/_lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import QueryString from 'qs'
import { useState } from 'react'
import { FaSearch } from 'react-icons/fa'


interface Props {
  className?: string
}

export default function Search({ className }: Props) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const query = useSearchParams().toString()
  const [term, setTerm] = useState(() => {
    return getQueryObj(query).search || ''
  })

  function setSearchInQuery(term: string) {
    const q = getQueryObj(query)
    if (term.length) {
      q.search = term
    } else {
      delete q.search
    }
    const newQueryString = QueryString.stringify(q)
    replace(`${pathname}?${newQueryString}`)
  }

  return (
    <div className={`${styles.search} ${className || ''}`}>
      <input
        className={styles.search__input}
        type="text" name="search"
        value={term}
        placeholder="Buscar productos en NextMarket"
        onChange={e => setTerm(e.target.value)}
        onKeyDown={e => { if (e.key == 'Enter') setSearchInQuery(term) }}
        autoComplete='off'
        defaultValue={getQueryObj(pathname).search}
      />
      <button
        className={styles.search__btn}
        onClick={() => setSearchInQuery(term)}
      >
        <FaSearch size='100%' />
      </button>
    </div>
  )
}