import { getAdmin } from '@/_lib/data'
import NextAuth, { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'


const options: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    maxAge: 60 * 60 * 16
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        name: { type: 'text', label: 'Usuario' },
        password: { type: 'password', label: 'Contraseña' },
      },
      async authorize(credentials, _req) {
        if (!credentials) throw new Error('No se han enviado las credenciales')
        return await getAdmin(credentials) as any
      }
    })
  ],
  pages: {
    signIn: '/admin/auth',
    error: '/admin/auth'
  }
}

const handler = NextAuth(options)
export { handler as GET, handler as POST }