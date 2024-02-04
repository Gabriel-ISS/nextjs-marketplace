'use client'

import CategoryFiltersSelector from '@/_Components/Filters/CategoryFiltersSelector'
import CategorySelector from '@/_Components/Filters/CategorySelector'
import styles from '@/_Components/Filters/Filters.module.scss'
import TagSelector from '@/_Components/Filters/TagSelector'
import useScrollLock from '@/_hooks/useLockScroll'
import { useState } from 'react'
import { FaFilter } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'


export default function Filters() {
  const [isOpen, setIsOpen] = useState(false)
  const { lockScroll, unlockScroll } = useScrollLock()

  function toggleSidebar() {
    if (isOpen) {
      setIsOpen(false)
      unlockScroll()
    } else {
      setIsOpen(true)
      lockScroll()
    }
  }

  return (
    <aside className={styles.filters} data-state={isOpen ? "opened" : "closed"}>

      <CategorySelector />
      <CategoryFiltersSelector/>
      <TagSelector />

      <button className={styles.filters__toggle_btn} onClick={toggleSidebar}>
        {isOpen ? <IoMdClose size='100%' /> : <FaFilter size='70%' />}
      </button>

    </aside>
  )
}