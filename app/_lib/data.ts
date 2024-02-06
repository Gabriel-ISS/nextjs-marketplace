'use server'

import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { connectDB } from '@/_lib/db'
import { Filter, Group, Product, User, safeUserProjection } from '@/_lib/models'
import { ServerSideError, getErrorMessage } from '@/_lib/server-utils'
import { FilterQuery } from 'mongoose'
import { getServerSession } from 'next-auth'
import QueryString from 'qs'


connectDB()

//d
export async function getProductGroups(): Promise<ActionRes<Group[]>> {
  try {
    const groups = await Group.find({})
    return { success: groups }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener los grupos de productos')
  }
}

//d
export async function getProductGroupsNC(): Promise<ActionRes<string[]>> {
  try {
    const groups = await Group.find({})
    return { success: groups.map(group => group.name) }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las etiquetas (NC)')
  }
}

//d
export async function getCategories(): Promise<ActionRes<string[]>> {
  try {
    const categoriesContainers = await Filter.find({}, { category: 1 })
    return { success: categoriesContainers.map(obj => obj.category) }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las categorías')
  }
}

//d
export async function getCategoryFiltersNC(category: string): Promise<ActionRes<FilterForFilters>> {
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
    return { success: noCounted }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener los filtros (NC)')
  }
}

//d
export async function getCategoriesWithImage(): Promise<ActionRes<{ name: string, image: string }[]>> {
  try {
    const categoriesContainers = await Filter.find({}, { category: 1, category_img: 1 })
    return {
      success: categoriesContainers.map(obj => ({
        name: obj.category,
        image: obj.category_img
      }))
    }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las categorías')
  }
}

//d
export async function getProducts(queryString: string): Promise<ActionRes<{ products: Product[], totalPages: number }>> {
  try {
    const LIMIT_PER_PAGE = 3 * 4;
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

//d
export async function getProduct(id?: string): Promise<ActionRes<Product>> {
  if (!id) return { success: DEFAULT_PRODUCT }

  try {
    const product = await Product.findById(id)
    return {
      success: JSON.parse(JSON.stringify(product))
    }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener el producto')
  }
}