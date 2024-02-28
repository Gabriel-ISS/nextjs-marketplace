import styles from '@/_Components/Navigation.module.scss'
import { revalidatePath } from '@/_lib/data'
import { getSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'


export default function LoginButton() {
  const { push } = useRouter()
  const path = usePathname()
  const search = useSearchParams().toString()

  useEffect(() => {
    (async () => {
      const res = await getSession()
      setIsLoggedIn(Boolean(res?.user))
    })()
  }, [path])

  const getCallbackUrl = () => `/auth?callbackUrl=${encodeURIComponent(`${path}?${search}`)}`

  const _signOut = async () => {
    await signOut({ redirect: false })
    await revalidatePath('/auth')
    push(getCallbackUrl())
  }

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  return (
    <>{isLoggedIn ? (
      <button className={styles.nav__login_btn} onClick={_signOut}>Cerrar sesión</button>
    ) : (
      <Link className={styles.nav__login_btn} href={getCallbackUrl()} role='button'>Iniciar sesión</Link>
    )}</>
  )
}