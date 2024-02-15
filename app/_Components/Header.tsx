'use client'

import Link from 'next/link'
import styles from '@/_Components/Header.module.scss'
import { useEffect, useRef, useState } from 'react';
import { MdMenu } from 'react-icons/md'
import { satisfy } from '@/_lib/fonts';
import ProductsLink from '@/_Components/ProductsLink';
import { getSession, signOut } from 'next-auth/react';
import { ADMIN_ROLES } from '@/constants';
import { usePathname, useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache';


export default function Header() {
  const router = useRouter()
  const path = usePathname()
  const linksContainer = useRef<HTMLDivElement | null>(null)
  // Controla el estado del elemento a esconder
  const [state, setState] = useState<'closed' | 'opened' | 'opening' | 'closing'>('closed');
  // Para saber si esta abriendo o esta abierto
  const isActive = state === 'opened' || state === 'opening'
  // Para accesibilidad
  const [ariaExpanded, setArialExpanded] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    (async () => {
      const res = await getSession()
      setIsLoggedIn(Boolean(res?.user))
    })()
  }, [path])

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

  async function _signOut() {
    await signOut({ redirect: false })
    router.push('/auth')
  }

  return (
    <header className={styles.header}>
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
              <li><ProductsLink /></li>
              <li><Link href='/about'>Sobre nosotros</Link></li>
            </ul>
            {isLoggedIn ? (
              <button className={styles.nav__admin_mode_btn} onClick={_signOut}>Cerrar sesión</button>
            ) : (
              <Link className={styles.nav__admin_mode_btn} href='/auth' role='button'>Iniciar sesión</Link>
            )}
          </div>
        </div>

      </nav>
    </header >
  )
}