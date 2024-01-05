import style from '@/_Components/Pagination.module.scss'
import useAppStore from '@/_store/useStore'
import { MouseEvent } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'


interface Props {
  totalPages: number
}

export default function Pagination({ totalPages }: Props) {
  const page = useAppStore(s => s.query.data.page || 1)
  const setPage = useAppStore(s => s.query.setPage)

  const changePage = (e: MouseEvent<HTMLButtonElement>) => {
    const toAdd = Number(e.currentTarget.value)
    setPage(page + toAdd)
  }

  return (
    <div className={style.pagination}>
      <button className={style.pagination__prev} disabled={page == 1} value={-1} onClick={changePage}><FaArrowLeft /> Anterior</button>
      <button className={style.pagination__next} disabled={page == totalPages} value={1} onClick={changePage}>Siguiente <FaArrowRight /></button>
    </div>
  )
}