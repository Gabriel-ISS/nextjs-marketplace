'use server'

import { Product } from '@/_lib/models'
import { withoutID } from '@/_lib/utils'
import { checkAuthentication, createFilter, explainPFData, updateFilter, updateTags } from '@/_lib/server-utils'
import { DEFAULT_PRODUCT } from '@/_lib/constants'


export async function saveProduct(product: Product, newFilters: NewFilters) {
  await checkAuthentication()
  const { toIncrease, toReduce } = await explainPFData(product, newFilters)

  const createOrUpdateProduct = async () => {
    if (product._id.length) {
      try {
        return await Product.findByIdAndUpdate(product._id, withoutID(product))
      } catch (error) {
        throw new Error("Can't create product")
      }
    } else {
      try {
        return await Product.create(withoutID(product))
      } catch (error) {
        throw new Error("Can't create product")
      }
    }
  }

  const createOrUpdateFilter = async () => {
    if (newFilters.category) {
      return await createFilter(newFilters)
    } else {
      return await updateFilter(product.category, newFilters, toIncrease, toReduce)
    }
  }

  await Promise.all([
    createOrUpdateProduct(),
    createOrUpdateFilter(),
    updateTags(newFilters.tags, toIncrease.tags, toReduce.tags)
  ])

  if (product._id.length) {
    return 'Producto actualizado correctamente'
  } else {
    return 'Producto registrado correctamente'
  }
}

export async function deleteProduct(_id: string, category: string) {
  await checkAuthentication()
  const emptyNewFilters = { category: '', brand: '', commonProperties: [], tags: [] }
  const { toIncrease, toReduce } = await explainPFData({ ...DEFAULT_PRODUCT, _id }, emptyNewFilters)

  await Promise.all([
    Product.findByIdAndDelete(_id),
    updateFilter(category, emptyNewFilters, toIncrease, toReduce),
    updateTags(emptyNewFilters.tags, toIncrease.tags, toReduce.tags)
  ])

  return 'Producto eliminado correctamente'
}