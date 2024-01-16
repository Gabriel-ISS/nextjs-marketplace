import type { Metadata } from 'next'
import '@/globals.scss'
import { openSans } from '@/_lib/fonts'
import Header from '@/_Components/Header'
import Footer from '@/_Components/Footer'
import Modal from '@/_Components/Modal/Modal'

export const metadata: Metadata = {
  title: 'NextMarket',
  description: 'Este es solo un ejemplo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={openSans.className}>
        <Modal />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
