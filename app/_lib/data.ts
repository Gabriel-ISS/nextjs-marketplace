'use server'

import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { Filter, Group, Product, User } from '@/_lib/models'
import { connectDB } from '@/_lib/server-utils'
import { FilterQuery } from 'mongoose'
import QueryString from 'qs'


connectDB()


export async function getProductTags(): Promise<Group[]> {
  try {
    const groups = await Group.find({})
    return groups
  } catch (error) {
    throw new Error('Failed to fetch tags')
  }
}

export async function getProductTagsNC(): Promise<string[]> {
  try {
    const groups = await Group.find({})
    return groups.map(group => group.name)
  } catch (error) {
    throw new Error('Failed to fetch no counted tags')
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const categoriesContainers = await Filter.find({}, { category: 1 })
    return categoriesContainers.map(obj => obj.category)
  } catch (error) {
    throw new Error('Failed to fetch categories')
  }
}

export async function getCategoryFiltersNC(category: string): Promise<FilterNoCounted> {
  try {
    const filters = await Filter.findOne({ category })
    if (!filters) throw new Error('No filters found')
    const noCounted: FilterNoCounted = {
      category: filters.category,
      brands: filters.brands.map(brand => brand.name),
      commonProperties: filters.commonProperties.map(property => ({
        name: property.name,
        values: property.values.map(value => value.name)
      }))
    }
    return noCounted
  } catch (error) {
    throw new Error('Failed to fetch filters')
  }
}

export async function getProducts(queryString: string): Promise<Product[]> {
  const LIMIT_PER_PAGE = 10
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
    const products = await Product.find(mongoQuery).limit(LIMIT_PER_PAGE).skip(LIMIT_PER_PAGE * (page - 1))
    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    throw new Error('Failed to fetch products')
  }
}

export async function getProduct(id?: string): Promise<Product> {
  if (!id) return DEFAULT_PRODUCT

  try {
    const product = await Product.findById(id)
    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    throw new Error('Failed to fetch product')
  }
}

export async function getAdmin(credentials: Pick<User, 'name' | 'password'>): Promise<User> {
  // credentials también incluye información como el callbackURL
  const user = await User.findOne({
    name: credentials.name, 
    password: credentials.password
  });
  if (!user) throw new Error('Usuario o contraseña incorrectos.');
  return user
}