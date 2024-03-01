'use client'

import styles from '@/_components/Navigation.module.scss';
import { satisfy } from '@/_lib/fonts';
import LoginButton from '@/_reusable_components/LoginButton';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { MdMenu } from 'react-icons/md';


export default function Navigation() {
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
    <nav className={styles.nav}>

      <div className={styles.nav__content}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link className={styles.nav__primary_link} href="/"><h1 className={satisfy.className}><img src='/logo.svg' alt='logo' width={33} height={33} /> NextMarket</h1></Link>

        <button
          className={styles.nav__menu_btn}
          onClick={toggleState}
        >
          <span className={styles.hidden} aria-hidden='true'>Menu</span>
          <MdMenu size="3rem" />
        </button>

        <div
          className={styles.nav__collapsible}
          aria-expanded={ariaExpanded}
          ref={linksContainer}
          data-state={state}
          onTransitionEnd={handleTransitionEnd}>
          <ul className={styles.nav__links_list}>
            <li><Link href='/'>Inicio</Link></li>
            <li><Link href='/products'>Productos</Link></li>
            <li><Link href='/cart'>Carrito de compras</Link></li>
            <li><Link href='/about'>Sobre nosotros</Link></li>
          </ul>
          <LoginButton />
        </div>
      </div>

    </nav>
  )
}