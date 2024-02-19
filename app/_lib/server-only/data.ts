import 'server-only'

import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { CategoryWithImage, GetProductReturn, GetProductsReturn } from '@/_lib/data'
import { connectDB } from '@/_lib/db'
import { Filter, Group, Product, User } from '@/_lib/models'
import { ServerSideError, getErrorMessage } from '@/_lib/server-only/utils'
import { Document, FilterQuery } from 'mongoose'
import { getServerSession } from 'next-auth'
import QueryString from 'qs'
import { cache } from 'react'


export const getProductGroups = cache(async (): Promise<ActionRes<Group[]>> => {
  try {
    await connectDB()
    const groups = await Group.find({})
    return { success: groups }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener los grupos de productos')
  }
})

export const getCategoriesWithImage = cache(async (): Promise<ActionRes<CategoryWithImage[]>> => {
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
})

export const getProducts = cache(async (queryString: string | undefined): Promise<GetProductsReturn> => {
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
})

export const getProduct = cache(async (id?: string): Promise<GetProductReturn> => {
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
})

export const getSafeUser = cache(async (): Promise<ActionRes<SafeUser & Document>> => {
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
})