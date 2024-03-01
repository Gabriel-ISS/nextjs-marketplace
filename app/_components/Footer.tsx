import { FaWhatsapp, FaTiktok, FaInstagram, FaFacebook } from 'react-icons/fa'

import styles from '@/_components/Footer.module.scss'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__content}>
        <ul className={styles.footer__links_l}>
          <li><Link href="/schedule">Horarios de atención</Link></li>
          <li><Link href="/about">Sobre nosotros</Link></li>
          <li><Link href="/terms-and-conditions">Términos y condiciones</Link></li>
          <li><Link href="/policy">Política de cambio, devolución y reembolso</Link></li>
        </ul>
        <ul className={styles.footer__social_media_l}>
          <li><a className={styles.whatsapp} href="#"><FaWhatsapp /></a></li>
          <li><a className={styles.tiktok} href="#"><FaTiktok /></a></li>
          <li><a className={styles.instagram} href="#"><FaInstagram /></a></li>
          <li><a className={styles.facebook} href="#"><FaFacebook /></a></li>
        </ul>
      </div>
      <small className={styles.footer__copyright}>© NextMarket - Todos los derechos reservados.</small>
    </footer>
  )
}