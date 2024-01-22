'use server'

import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { Filter, Group, Product, User } from '@/_lib/models'
import { connectDB } from '@/_lib/server-utils'
import { ServerSideError } from '@/_lib/utils'
import { FilterQuery, PipelineStage } from 'mongoose'
import QueryString from 'qs'


connectDB()


export async function getProductTags(): Promise<Group[]> {
  try {
    const groups = await Group.find({})
    return groups
  } catch (error) {
    throw new ServerSideError('Falla al obtener las etiquetas')
  }
}

export async function getProductTagsNC(): Promise<string[]> {
  try {
    const groups = await Group.find({})
    return groups.map(group => group.name)
  } catch (error) {
    throw new ServerSideError('Falla al obtener las etiquetas (NC)')
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const categoriesContainers = await Filter.find({}, { category: 1 })
    return categoriesContainers.map(obj => obj.category)
  } catch (error) {
    throw new ServerSideError('Falla al obtener las categorías')
  }
}

export async function getCategoryFiltersNC(category: string): Promise<FilterForFilters> {
  try {
    const filters = await Filter.findOne({ category })
    if (!filters) throw new ServerSideError(`No se encontraron los filtros para la categoría "${category}"`)
    const noCounted: FilterForFilters = {
      category: filters.category,
      brands: filters.brands.map(brand => brand.name),
      properties: filters.properties.map(property => ({
        name: property.name,
        values: property.values.map(value => value.name)
      }))
    }
    return noCounted
  } catch (error) {
    throw new ServerSideError('Falla al obtener los filtros (NC)')
  }
}

export async function getCategoriesWithImage() {
  try {
    const categoriesContainers = await Filter.find({}, { category: 1, category_img: 1 })
    return categoriesContainers.map(obj =>( {
      name: obj.category,
      image: obj.category_img
    }))
  } catch (error) {
    throw new ServerSideError('Falla al obtener las categorías')
  }
}

export async function getProducts(queryString: string): Promise<{ products: Product[], totalPages: number }> {
  const LIMIT_PER_PAGE = 3 * 6;
  let page = 1
  let mongoQuery: FilterQuery<Product> = {}
  if (queryString.length) {
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

  try {
    const count = await Product.countDocuments(mongoQuery)
    const totalPages = Math.ceil(count / LIMIT_PER_PAGE)
    const products = await Product.find(mongoQuery).limit(LIMIT_PER_PAGE).skip(LIMIT_PER_PAGE * (page - 1))
    return JSON.parse(JSON.stringify({ products, totalPages }))
  } catch (error) {
    throw new ServerSideError('Fallo al obtener los productos')
  }
}

export async function getProduct(id?: string): Promise<Product> {
  if (!id) return DEFAULT_PRODUCT

  try {
    const product = await Product.findById(id)
    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    throw new ServerSideError('Falla al obtener el producto product')
  }
}

export async function getAdmin(credentials: Pick<User, 'name' | 'password'>): Promise<User> {
  // credentials también incluye información como el callbackURL
  const user = await User.findOne({
    name: credentials.name,
    password: credentials.password
  });
  if (!user) throw new ServerSideError('Usuario o contraseña incorrectos.');
  return user
}