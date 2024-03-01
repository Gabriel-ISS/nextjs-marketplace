import { ADMIN_ROLES, NOT_AUTHENTICATED_ERROR, UNAUTHORIZED_USER_ERROR } from '@/constants'
import { Session } from 'next-auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'


export async function middleware(req: NextRequest) {
  const CHECK_IF_ADMIN_ROUTES = ['/product/editor']
  //const CHECK_IF_REAL_ADMIN_ROUTES = []

  const requestPath = req.nextUrl.pathname

  if (CHECK_IF_ADMIN_ROUTES.includes(requestPath)) {
    let sessionToken = req.cookies.get('next-auth.session-token')?.value
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    }
    if (sessionToken) {
      headers["Cookie"] = `next-auth.session-token=${sessionToken};path=/;expires=Session`
    }
    const endpoint = process.env.NEXT_PUBLIC_HOST + '/api/auth/session'
    const session: Session | null = await fetch(endpoint,
      { method: 'GET', headers, cache: 'no-store' }
    ).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}\nAt route ${endpoint}`);
      }
      return res.json()
    })

    if (!session) return new NextResponse(NOT_AUTHENTICATED_ERROR, { status: 401 })
    if (!ADMIN_ROLES.includes(session.user.role as string)) return new NextResponse(UNAUTHORIZED_USER_ERROR, { status: 403 })
  }

  return NextResponse.next()
}