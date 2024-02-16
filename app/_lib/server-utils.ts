import 'server-only';

import { deleteImages, saveTagImage } from '@/_lib/aws-s3';
import { FilterManager, RelevantFilterData } from '@/_lib/filter-manager';
import { Filter, Group, Product, User } from '@/_lib/models';
import { S_ERROR_TAG, TEST_ADMIN } from '@/constants';
import { FilterQuery, Types, mongo } from "mongoose";
import { getServerSession } from 'next-auth';
import { Document } from 'mongoose';
import { redirect } from 'next/navigation';
import { CategoryWithImage, GetProductReturn, GetProductsReturn } from '@/_lib/data';
import { connectDB } from '@/_lib/db';
import QueryString from 'qs';
import { DEFAULT_PRODUCT } from '@/_lib/constants';

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

export async function getProductGroups(): Promise<ActionRes<Group[]>> {
  try {
    await connectDB()
    const groups = await Group.find({})
    return { success: groups }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener los grupos de productos')
  }
}

export async function getCategoriesWithImage(): Promise<ActionRes<CategoryWithImage[]>> {
  try {
    await connectDB()
    const categoriesContainers = await Filter.find({}, { category: 1, categoryImgPath: 1 })
    return {
      success: categoriesContainers.map(obj => ({
        name: obj.category,
        imgPath: obj.categoryImgPath
      }))
    }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las categorías')
  }
}

export async function getProducts(queryString: string | undefined): Promise<GetProductsReturn> {
  try {
    await connectDB()
    const LIMIT_PER_PAGE = 3 * 4;
    let page = 1
    let mongoQuery: FilterQuery<Product> = {}
    if (queryString && queryString.length) {
      const query = QueryString.parse(queryString) as unknown as Query

      if (query.page) page = query.page

      if (query.search) mongoQuery.name = { $regex: RegExp(query.search, 'i') }

      if (query.category) mongoQuery.category = query.category

      if (query.brands) mongoQuery.brand = { $in: query.brands }

      if (query.properties) {
        mongoQuery.$and = []
        Object.entries(query.properties).forEach(([name, values]) => {
          mongoQuery.$and?.push({
            $and: [
              { 'properties.name': name },
              { 'properties.values': { $in: values } }
            ]
          })
        })
      }

      if (query.tags) mongoQuery.tags = { $in: query.tags }
    }

    const count = await Product.countDocuments(mongoQuery)
    const totalPages = Math.ceil(count / LIMIT_PER_PAGE)
    const products = await Product.find(mongoQuery).limit(LIMIT_PER_PAGE).skip(LIMIT_PER_PAGE * (page - 1))
    return {
      success: JSON.parse(JSON.stringify({ products, totalPages }))
    }
  } catch (error) {
    return getErrorMessage(error, 'Fallo al obtener los productos')
  }
}

export async function getProduct(id?: string): Promise<GetProductReturn> {
  if (!id) return { success: DEFAULT_PRODUCT }

  try {
    await connectDB()
    const product = await Product.findById(id)
    return {
      success: JSON.parse(JSON.stringify(product))
    }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener el producto')
  }
}

export async function getSafeUser(): Promise<ActionRes<SafeUser & Document>> {
  try {
    await connectDB()
    const session = await getServerSession()
    if (!session) throw new ServerSideError('Usuario no autenticado')
    const user = await User.findOne({ name: session.user.name })
    if (!user) throw new ServerSideError('Usuario no encontrado')
    return { success: user }
  } catch (error) {
    return getErrorMessage(error, 'Error al obtener el usuario')
  }
}