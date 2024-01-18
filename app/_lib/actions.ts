'use server'

import { deleteImages, saveProductImage } from '@/_lib/aws-s3'
import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { RelevantFilterDataKeys } from '@/_lib/filter-manager'
import { Product } from '@/_lib/models'
import { checkAuthentication, updateFilters, updateTags } from '@/_lib/server-utils'
import { ServerSideError, withoutID } from '@/_lib/utils'


export async function saveProduct(product: Product, newTags: UnsavedGroup[]) {
  await checkAuthentication()
  const getPrevProduct = async () => {
    if (productExist) {
      type MinProduct = Pick<Product, RelevantFilterDataKeys | 'tags' | 'image'>
      const projection: Projection<MinProduct, 1> = { image: 1, category: 1, brand: 1, properties: 1, tags: 1 }
      const p = await Product.findById<MinProduct>(product._id, projection)
      if (!p) throw new ServerSideError(`El producto con id ${product._id} no fue encontrado`)
      return p
    } else {
      return DEFAULT_PRODUCT
    }
  }

  const productExist = product._id.length
  const prevProduct = await getPrevProduct()

  const createOrUpdateProduct = async () => {
    const loadImage = product.image.startsWith('data:')
    if (loadImage) {
      const imgLink = await saveProductImage(product._id, product.image)
      product.image = imgLink
    }
    if (productExist) {
      if (loadImage) await deleteImages(prevProduct.image)
      try {
        return await Product.findByIdAndUpdate(product._id, withoutID(product))
      } catch (error) {
        throw new ServerSideError('No se pudo actualizar el producto')
      }
    } else {
      try {
        return await Product.create(withoutID(product))
      } catch (error) {
        throw new ServerSideError('No se pudo crear el producto')
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
  if (!prevProduct) throw new ServerSideError('No se pudo encontrar el producto a eliminar')

  await Promise.all([
    deleteImages(prevProduct.image),
    prevProduct.deleteOne(),
    updateFilters(DEFAULT_PRODUCT, prevProduct),
    updateTags([], [], prevProduct.tags)
  ])

  return 'Producto eliminado correctamente'
}