'use server'

import { Filter, Product } from '@/_lib/models'
import { withoutID } from '@/_lib/utils'
import { checkAuthentication, createFilter, /* explainPFData, */ updateFilters, updateTags } from '@/_lib/server-utils'
import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { RelevantFilterDataKeys } from '@/_lib/filter-manager'


export async function saveProduct(product: Product, newFilters: NewFilters) {
  await checkAuthentication()
  //const { toIncrease, toReduce } = await explainPFData(product, newFilters)
  const productExist = product._id.length
  const prevProduct = await (async () => {
    if (productExist) {
      type MinProduct = Pick<Product, RelevantFilterDataKeys | 'tags'>
      const projection: Projection<MinProduct, 1> = { category: 1, brand: 1, properties: 1, tags: 1 }
      const p = await Product.findById<MinProduct>(product._id, projection)
      if (!p) throw new Error(`El producto con id ${product._id} no fue encontrado`)
      return p
    } else {
      return DEFAULT_PRODUCT
    }
  })()

  const createOrUpdateProduct = async () => {
    if (productExist) {
      try {
        return await Product.findByIdAndUpdate(product._id, withoutID(product))
      } catch (error) {
        throw new Error('No se pudo actualizar el producto')
      }
    } else {
      try {
        return await Product.create(withoutID(product))
      } catch (error) {
        console.log(error)
        throw new Error('No se pudo crear el producto')
      }
    }
  }

  const createOrUpdateFilter = async () => {
    if (newFilters.category) {
      return await createFilter(newFilters)
    } else {
      return await updateFilters(product, prevProduct)
      //return await updateFilter(product.category, newFilters, toIncrease, toReduce)
    }
  }

  await Promise.all([
    createOrUpdateProduct(),
    createOrUpdateFilter(),
    //updateTags(newFilters.tags, toIncrease.tags, toReduce.tags)
    updateTags(newFilters.tags, product.tags, prevProduct.tags)
  ])

  if (product._id.length) {
    return 'Producto actualizado correctamente'
  } else {
    return 'Producto registrado correctamente'
  }
}

export async function deleteProduct(_id: string, category: string) {
  await checkAuthentication()



  //throw new Error('No implementado')


  //const emptyNewFilters: NewFilters = { category: '', brand: '', properties: [], tags: [] }
  //const { toIncrease, toReduce } = await explainPFData({ ...DEFAULT_PRODUCT, _id }, emptyNewFilters)

  const prevProduct = await Product.findById(_id)
  if (!prevProduct) throw new Error('No se pudo encontrar el producto a eliminar')

  await Promise.all([
    //Product.findByIdAndDelete(_id),
    prevProduct.deleteOne(),
    updateFilters(DEFAULT_PRODUCT, prevProduct),
    updateTags([], [], prevProduct.tags)
    //updateFilter(category, emptyNewFilters, toIncrease, toReduce),
    //updateTags(product.tags)
  ])

  return 'Producto eliminado correctamente'
}