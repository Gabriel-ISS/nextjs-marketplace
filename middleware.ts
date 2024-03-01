import { ADMIN_ROLES, NOT_AUTHENTICATED_ERROR, UNAUTHORIZED_USER_ERROR } from '@/constants'
import { decode } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'


export async function middleware(req: NextRequest) {
  const CHECK_IF_ADMIN_ROUTES = ['/product/editor']
  //const CHECK_IF_REAL_ADMIN_ROUTES = []

  const requestPath = req.nextUrl.pathname

  if (CHECK_IF_ADMIN_ROUTES.includes(requestPath)) {
    let tokenKey = process.env.NODE_ENV === 'production' ? '__secure-next-auth.session-token' : 'next-auth.session-token';
    let sessionToken = req.cookies.get(tokenKey)?.value
    const userDecodedToken = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET as string,
    })

    if (!userDecodedToken) return new NextResponse(NOT_AUTHENTICATED_ERROR, { status: 401 })
    if (!ADMIN_ROLES.includes(userDecodedToken.role as string)) return new NextResponse(UNAUTHORIZED_USER_ERROR, { status: 403 })
  }

  return NextResponse.next()
}