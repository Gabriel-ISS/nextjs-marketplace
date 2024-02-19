import { connectDB } from '@/_lib/db'
import { User } from '@/_lib/models'
import { ServerSideError, getErrorMessage } from '@/_lib/server-only/utils'
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
        if (!credentials) throw new ServerSideError('No se han enviado las credenciales')
        const res = await getUser(credentials)
        if (res.error) throw new Error(res.error)
        return res.success as any
      }
    })
  ],
  pages: {
    signIn: '/auth',
    error: '/auth'
  }
}

const handler = NextAuth(options)
export { handler as GET, handler as POST }


async function getUser<C extends Pick<User, 'name' | 'password'>>(credentials: C): Promise<ActionRes<SafeUser>> {
  try {
    connectDB()
    const user = await User.findOne({
      name: credentials.name,
      password: credentials.password
    });
    if (!user) throw new ServerSideError('Usuario o contraseña incorrectos.');
    return { success: user }
  } catch (error) {
    return getErrorMessage(error, 'Error al obtener el usuario')
  }
}