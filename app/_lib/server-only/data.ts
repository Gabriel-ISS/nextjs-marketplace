import 'server-only'

import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { CategoryWithImage, GetCartProductsParams, GetCartProductsReturn, GetProductReturn, GetProductsReturn } from '@/_lib/data'
import { connectDB } from '@/_lib/db'
import { Cart, Filter, Group, Product, User } from '@/_lib/models'
import { nextAuthOptions, ServerSideError, getErrorMessage } from '@/_lib/server-only/utils'
import { Document, FilterQuery } from 'mongoose'
import { getServerSession } from 'next-auth'
import QueryString from 'qs'
import { cache } from 'react'
import { NOT_AUTHENTICATED_ERROR, USER_NOT_FOUND_ERROR } from '@/constants'


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
  if (!id || id == 'undefined') return { success: DEFAULT_PRODUCT }

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
    const session = await getServerSession(nextAuthOptions)
    if (!session) throw new ServerSideError(NOT_AUTHENTICATED_ERROR)
    const user = await User.findById(session.user.id)
    if (!user) throw new ServerSideError(USER_NOT_FOUND_ERROR)
    return { success: user }
  } catch (error) {
    return getErrorMessage(error, 'Error al obtener el usuario')
  }
})

export const pickFromUser = cache(async <K extends PublicUserKey>(key: K): Promise<ActionRes<SafeUser[K]>> => {
  try {
    await connectDB()
    const session = await getServerSession(nextAuthOptions)
    if (!session) throw new ServerSideError(NOT_AUTHENTICATED_ERROR)
    const user = await User.findById(session.user.id, { [key]: 1 })
    if (!user) throw new ServerSideError(USER_NOT_FOUND_ERROR)
    return { success: user[key] }
  } catch (error) {
    return getErrorMessage(error, 'Error al obtener el usuario')
  }
})

export const getCartProducts = cache(async <P extends GetCartProductsParams>(params: P): Promise<GetCartProductsReturn<P>> => {
  let res: GetCartProductsReturn<P>;
  const NOT_PRODUCT_YET_MESSAGE = 'Aun no has agregado productos a tu carrito'
  try {
    await connectDB()
    const session = await getServerSession(nextAuthOptions)
    if (!session) throw new ServerSideError('Para ver su carrito primero debe iniciar session o crear una cuenta')
    if (params.onlyIDs) {
      const cart = await Cart.findOne({ userID: session.user.id }, { products: 1 })
      if (!cart) throw new ServerSideError(NOT_PRODUCT_YET_MESSAGE)
      const IDs = cart.products.map(p => p.ID.toString())
      res = { success: IDs } as GetCartProductsReturn<P>
    } else {
      const productProjection: Projection<CartProduct, 1> = { imgPath: 1, name: 1, price: 1 }
      const cart = await Cart.findOne({ userID: session.user.id }, { products: 1 }).populate('products.ID', productProjection) as Cart<'populated'>
      if (!cart) throw new ServerSideError(NOT_PRODUCT_YET_MESSAGE)
      const products = cart.products.map(p => ({ ...(p.ID as unknown as { _doc: CartProduct })._doc, quantity: p.quantity }))
      res = { success: products } as GetCartProductsReturn<P>
    }
  } catch (error) {
    res = getErrorMessage(error, 'Error al obtener el usuario')
  }
  return res
})