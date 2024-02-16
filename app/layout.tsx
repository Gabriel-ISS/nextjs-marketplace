import Footer from '@/_Components/Footer'
import Navigation from '@/_Components/Navigation'
import { openSans } from '@/_lib/fonts'
import '@/globals.scss'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
/* import { Suspense } from 'react'
const Modal = dynamic(() => import('@/_Components/Modal/Modal'), { ssr: false }) */

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
        {/* <Modal /> */}
        {/* <header style={{ zIndex: 1 }}>
          <Suspense fallback={<></>}>
            <Navigation />
          </Suspense>
        </header> */}
            <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}
