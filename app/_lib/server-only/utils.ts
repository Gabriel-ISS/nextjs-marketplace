import 'server-only'

import { deleteImages, saveTagImage } from '@/_lib/aws-s3'
import { FilterManager, RelevantFilterData } from '@/_lib/filter-manager'
import { Filter, Group, User } from '@/_lib/models'
import { NOT_AUTHENTICATED_ERROR, S_ERROR_TAG, TEST_ADMIN, UNAUTHORIZED_USER_ERROR, USER_NOT_FOUND_ERROR } from '@/constants'
import { Types, mongo } from "mongoose"
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { connectDB } from '@/_lib/db'

type ExtraData = { send?: boolean }
export class ServerSideError extends Error {
  constructor(message: string, extraData: ExtraData = {}) {
    if (extraData.send) {
      super(S_ERROR_TAG + 'Por favor reporte el error a la empresa.\n' + message)
    } else {
      super(S_ERROR_TAG + message)
    }
  }
}

export const nextAuthOptions: NextAuthOptions = {
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
        if (!res.success) throw new Error(res.error)
        const { _id, name, role } = res.success
        return { id: _id, name, role }
      }
    })
  ],
  pages: {
    signIn: '/auth',
    error: '/auth'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if (user.role) token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
}

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

export function getErrorMessage(error: unknown, defaultMessage: string) {
  let message = defaultMessage

  if (error instanceof ServerSideError) {
    message = error.message
  }
  // error desconocido
  else if (error instanceof Error) {
    if (error.message == 'NEXT_REDIRECT') {
      const path = (error as any as Record<string, string>).digest.split(';')[2]
      redirect(path)
    } else {
      console.log(error.message)
    }
  }
  // error desconocido
  else if (error && typeof error == 'object' && 'message' in error) {
    console.log(error.message)
  }
  else {
    message = 'Algo ha salido mal'
  }

  return {
    error: message
  }
}

export async function checkIfRealAdmin() {
  const session = await getServerSession(nextAuthOptions)
  if (!session) throw new ServerSideError(NOT_AUTHENTICATED_ERROR)
  if (session.user.role == 'fake admin') throw new ServerSideError(`Las acciones en el servidor no están autorizadas para el usuario "${TEST_ADMIN.name}"`)
  if (session.user.role !== 'admin') throw new ServerSideError(UNAUTHORIZED_USER_ERROR)
}

export async function updateFilters(product: RelevantFilterData, prevProduct: RelevantFilterData, rawCategoryImg: string) {
  const getFilter = async (category: string) => {
    const filter = await Filter.findOne({ category })
    if (!filter) throw new ServerSideError(`No se pudo encontrar el filtro a actualizar de categoría "${category}"`)
    return filter
  }

  const updateFilter = async (current: RelevantFilterData, previous: RelevantFilterData) => {
    const filter = await getFilter(current.category)
    return await new FilterManager({ filter }).modify(current, previous).updateDB()
  }

  const CurrentHasCategory = product.category.length
  const PreviousHasCategory = prevProduct.category.length

  // update (depends)
  if (CurrentHasCategory && PreviousHasCategory) {
    // update filter
    if (product.category == prevProduct.category) {
      return await updateFilter(product, prevProduct)
    }
    // update filters
    else {
      return await Promise.all([
        updateFilter(product, prevProduct),
        updateFilter(prevProduct, product)
      ])
    }
  }
  // increase/create
  else if (CurrentHasCategory && !PreviousHasCategory) {
    const filter = await Filter.findOne({ category: product.category })
    // increase
    if (filter) {
      return await new FilterManager({ filter }).increase(product).updateDB()
    }
    // create
    else {
      return await new FilterManager({
        product: {
          data: product,
          rawCategoryImage: rawCategoryImg
        }
      }).updateDB()
    }
  }
  // reduce/remove
  else if (PreviousHasCategory && !CurrentHasCategory) {
    const filter = await getFilter(prevProduct.category)
    return await new FilterManager({ filter }).reduce(prevProduct).updateDB()
  }
  // error
  else {
    throw new ServerSideError('Ninguna de las versiones del producto (anterior y actual) tiene una categoría asociada')
  }
}

export async function updateTags(newGroups: UnsavedGroup[], tags: string[], prevTags: string[]) {
  const separateTags = async () => {
    const existAndSelectedGroups = await Group.find({ name: { $in: tags } })
    const existAndSelected = existAndSelectedGroups.map(g => g.name)

    // Existe y esta seleccionado
    const toIncrease = existAndSelectedGroups.map(g => g.name)
    // Existe, pero no esta seleccionado. Esta en prevFilter
    const reduce = prevTags.filter(t => !existAndSelected.includes(t))

    const reduceGroups = await Group.find({ name: { $in: reduce } })

    const toReduce = reduceGroups.filter(g => g.used > 1).map(g => g.name)
    const _toDelete = reduceGroups.filter(g => g.used <= 1)
    const toDelete = _toDelete.map(g => g.name)
    const toDeleteImages = _toDelete.map(g => g.imgPath)

    return { toReduce, toDelete, toIncrease, toDeleteImages }
  }

  const { toReduce, toDelete, toIncrease, toDeleteImages } = await separateTags()

  await Promise.all(newGroups.map(async g => {
    const id = new Types.ObjectId()
    // @ts-ignore
    g._id = id
    g.imgPath = await saveTagImage(id.toString(), g.imgPath)
  }))


  type FirstParam<T> = T extends (param: infer U) => any ? U : never
  const operations: FirstParam<typeof Group.bulkWrite> = []

  const query = {
    deleteMany: (tags: string[]): mongo.DeleteManyModel => ({
      filter: {
        name: { $in: tags }
      }
    }),
    increase: (tags: string[], incrementValue: 1 | -1): mongo.UpdateManyModel => ({
      filter: {
        name: { $in: tags }
      },
      update: {
        $inc: {
          used: incrementValue
        }
      }
    }),
    insert: (group: UnsavedGroup): mongo.InsertOneModel => ({
      document: group
    }),
  }

  operations.push({ deleteMany: query.deleteMany(toDelete) })
  operations.push({ updateMany: query.increase(toReduce, -1) })
  operations.push({ updateMany: query.increase(toIncrease, 1) })
  newGroups.forEach(group => operations.push({ insertOne: query.insert(group) }))

  try {
    return Promise.all([
      Group.bulkWrite(operations),
      deleteImages(...toDeleteImages)
    ])
  } catch (error) {
    throw new ServerSideError('Falla al actualizar las etiquetas')
  }
}