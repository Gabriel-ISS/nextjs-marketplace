import { nextAuthOptions } from '@/_lib/server-only/utils'
import NextAuth from 'next-auth'

const handler = NextAuth(nextAuthOptions)
export { handler as GET, handler as POST }
