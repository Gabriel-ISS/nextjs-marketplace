'use server'

import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { RelevantFilterDataKeys } from '@/_lib/filter-manager'
import { Product } from '@/_lib/models'
import { checkAuthentication, updateFilters, updateTags } from '@/_lib/server-utils'
import { CustomError, withoutID } from '@/_lib/utils'


export async function saveProduct(product: Product, newTags: UnsavedGroup[]) {
  await checkAuthentication()
  const getPrevProduct = async () => {
    if (productExist) {
      type MinProduct = Pick<Product, RelevantFilterDataKeys | 'tags'>
      const projection: Projection<MinProduct, 1> = { category: 1, brand: 1, properties: 1, tags: 1 }
      const p = await Product.findById<MinProduct>(product._id, projection)
      if (!p) throw new CustomError(`El producto con id ${product._id} no fue encontrado`)
      return p
    } else {
      return DEFAULT_PRODUCT
    }
  }

  const productExist = product._id.length
  const prevProduct = await getPrevProduct()

  const createOrUpdateProduct = async () => {
    if (productExist) {
      try {
        return await Product.findByIdAndUpdate(product._id, withoutID(product))
      } catch (error) {
        throw new CustomError('No se pudo actualizar el producto')
      }
    } else {
      try {
        return await Product.create(withoutID(product))
      } catch (error) {
        console.log(error)
        throw new CustomError('No se pudo crear el producto')
      }
    }
  }

  await Promise.all([
    createOrUpdateProduct(),
    updateFilters(product, prevProduct),
    updateTags(newTags, product.tags, prevProduct.tags)
  ])

  if (product._id.length) {
    return 'Producto actualizado correctamente'
  } else {
    return 'Producto registrado correctamente'
  }
}

export async function deleteProduct(_id: string) {
  await checkAuthentication()

  const prevProduct = await Product.findById(_id)
  if (!prevProduct) throw new CustomError('No se pudo encontrar el producto a eliminar')

  await Promise.all([
    prevProduct.deleteOne(),
    updateFilters(DEFAULT_PRODUCT, prevProduct),
    updateTags([], [], prevProduct.tags)
  ])

  return 'Producto eliminado correctamente'
}