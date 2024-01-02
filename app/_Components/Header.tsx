'use client'

import Link from 'next/link'
import styles from '@/_Components/Header.module.scss'
import { useRef, useState } from 'react';
import { MdMenu } from 'react-icons/md'
import { exo2 } from '@/_lib/fonts';


export default function Header() {
  const linksContainer = useRef<HTMLDivElement | null>(null)
  // Controla el estado del elemento a esconder
  const [state, setState] = useState<'closed' | 'opened' | 'opening' | 'closing'>('closed');
  // Para saber si esta abriendo o esta abierto
  const isActive = state === 'opened' || state === 'opening'
  // Para accesibilidad
  const [ariaExpanded, setArialExpanded] = useState(false);

  function toggleState() {
    if (state == 'closed') {
      if (linksContainer.current) {
        linksContainer.current.style.display = 'grid'
        setTimeout(() => {
          setState('opening')
        }, 10); // importante
      }
    } else if (state == 'opened') {
      setState('closing')
    }
  }

  function handleTransitionEnd() {
    if (state == 'opening') {
      setArialExpanded(true)
      setState('opened')
    } else if (state == 'closing') {
      if (linksContainer.current) {
        linksContainer.current.style.display = 'none'
      }
      setArialExpanded(false)
      setState('closed')
    }
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>

        <div className={styles.nav__content}>
          <Link className={styles.nav__primary_link} href="/"><h1 className={exo2.className}>PC CLICKS</h1></Link>

          <button
            className={styles.nav__menu_btn}
            onClick={toggleState}
          >
            <span className={styles.hidden} aria-hidden="true">Menu</span>
            <MdMenu size="2rem" />
          </button>

          <div
            className={styles.nav__collapsible}
            aria-expanded={ariaExpanded}
            ref={linksContainer}
            data-state={state}
            onTransitionEnd={handleTransitionEnd}>
            <ul className={styles.nav__links_list}>
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/products">Productos</Link></li>
              <li><Link href="/about">Sobre nosotros</Link></li>
            </ul>
          </div>
        </div>

      </nav>
    </header >
  )
}