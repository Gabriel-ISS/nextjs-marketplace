'use client'

import styles from '@/products/_components/Pagination.module.scss'
import { getQueryObj } from '@/_lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import QueryString from 'qs'
import { MouseEvent } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'


interface Props {
  totalPages: number
}

export default function Pagination({ totalPages }: Props) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const query = useSearchParams().toString()
  const page = getQueryObj(query).page || 1

  const changePage = (e: MouseEvent<HTMLButtonElement>) => {
    const toAdd = Number(e.currentTarget.value)
    const q = getQueryObj(query)

    if (!q.page) {
      q.page = 2
    } else {
      q.page += toAdd
      if (q.page <= 1) delete q.page
    }

    const newQueryString = QueryString.stringify(q)
    replace(`${pathname}?${newQueryString}`)
  }

  return (
    <div className={styles.pagination}>
      <button className={styles.pagination__prev} disabled={page == 1} value={-1} onClick={changePage}><FaArrowLeft /> Anterior</button>
      <button className={styles.pagination__next} disabled={page == totalPages} value={1} onClick={changePage}>Siguiente <FaArrowRight /></button >
    </div>
  )
}