'use client'

import useScrollLock from '@/_hooks/useLockScroll'
import styles from '@/_reusable_components/WithSidebar.module.scss'
import React, { ReactNode, createContext, useContext, useState } from 'react'


interface Props {
  sidebar: React.JSX.Element
  children: React.JSX.Element
}

const SidebarLayoutContext = createContext({ isOpen: false, toggleSidebar() { } })

export default function WithSidebar({ sidebar, children }: Props) {
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
    <SidebarLayoutContext.Provider value={{ isOpen, toggleSidebar }}>
      <div className={styles.layout}>
        {sidebar}
        {children}
      </div>
    </SidebarLayoutContext.Provider>
  )
}

interface SidebarContainerProps {
  children: ReactNode
  toggleButton: React.JSX.Element
}

export function SidebarContainer({ children, toggleButton }: SidebarContainerProps) {
  const { isOpen } = useContext(SidebarLayoutContext)

  return (
    <aside className={styles.sidebar} data-state={isOpen ? "opened" : "closed"}>
      {children}
      {toggleButton}
    </aside>
  )
}

interface SidebarToggleButtonProps {
  className?: string
  children: {
    whenOpen: ReactNode
    whenClosed: ReactNode
  }
}

export function SidebarToggleButton({ className = '', children }: SidebarToggleButtonProps) {
  const { isOpen, toggleSidebar } = useContext(SidebarLayoutContext)

  return (
    <button className={`${styles.sidebar__toggle_btn} ${className}`} onClick={toggleSidebar}>
      {isOpen ? children.whenOpen : children.whenClosed}
    </button>
  )
}