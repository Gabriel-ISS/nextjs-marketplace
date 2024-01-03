import { FaWhatsapp, FaTiktok, FaInstagram, FaFacebook } from 'react-icons/fa'

import style from '@/_Components/Footer.module.scss'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className={style.footer}>
      <div className={style.footer__content}>
        <ul className={style.footer__links_l}>
          <li><Link href="/schedule">Horarios de atención</Link></li>
          <li><Link href="/about">Sobre nosotros</Link></li>
          <li><Link href="/terms-and-conditions">Términos y condiciones</Link></li>
          <li><Link href="/policy">Política de cambio, devolución y reembolso</Link></li>
        </ul>
        <ul className={style.footer__social_media_l}>
          {/* TODO: completar */}
          <li><a className={style.whatsapp} href="#"><FaWhatsapp /></a></li>
          <li><a className={style.tiktok} href="#"><FaTiktok /></a></li>
          <li><a className={style.instagram} href="#"><FaInstagram /></a></li>
          <li><a className={style.facebook} href="#"><FaFacebook /></a></li>
        </ul>
      </div>
      <small className={style.footer__copyright}>© PC Click - Todos los derechos reservados.</small>
    </footer>
  )
}