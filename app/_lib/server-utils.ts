import 'server-only';

import { deleteImages, saveTagImage } from '@/_lib/aws-s3';
import { FilterManager, RelevantFilterData } from '@/_lib/filter-manager';
import { Filter, Group, User, safeUserProjection } from '@/_lib/models';
import { Types, mongo } from "mongoose";
import { getServerSession } from 'next-auth';
import { S_ERROR_TAG, TEST_ADMIN } from '@/constants';

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

export function getErrorMessage(error: unknown, defaultMessage: string) {
  let message = defaultMessage

  if (error instanceof ServerSideError) {
    message = error.message
  }
  // error desconocido
  else if (error instanceof Error) {
    console.log(error.message)
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
  const session = await getServerSession()
  if (!session) throw new ServerSideError('Usuario no autenticado')
  const user = await User.findOne({ name: session.user?.name }, { role: 1 })
  if (!user) throw new ServerSideError('Usuario no encontrado')
  if (user.role == 'fake admin') throw new ServerSideError(`Las acciones en el servidor no están autorizadas para el usuario "${TEST_ADMIN.name}"`)
  if (user.role !== 'admin') throw new ServerSideError('Usuario no autorizado')
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
    const toDeleteImages = _toDelete.map(g => g.image)

    return { toReduce, toDelete, toIncrease, toDeleteImages }
  }

  const { toReduce, toDelete, toIncrease, toDeleteImages } = await separateTags()

  await Promise.all(newGroups.map(async g => {
    const id = new Types.ObjectId()
    // @ts-ignore
    g._id = id
    g.image = await saveTagImage(id.toString(), g.image)
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

export async function getSafeUser(): Promise<ActionRes<SafeUser>> {
  try {
    const session = await getServerSession()
    if (!session) throw new ServerSideError('Usuario no autenticado')
    const user = await User.findOne({ name: session.user.name }, safeUserProjection)
    if (!user) throw new ServerSideError('Usuario no encontrado')
    return { success: user }
  } catch (error) {
    return getErrorMessage(error, 'Error al obtener el usuario')
  }
}