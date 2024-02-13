'use server'

import { deleteImages, saveProductImage } from '@/_lib/aws-s3'
import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { RelevantFilterDataKeys } from '@/_lib/filter-manager'
import { Product, User } from '@/_lib/models'
import { ServerSideError, checkIfRealAdmin, getErrorMessage, getSafeUser, updateFilters, updateTags } from '@/_lib/server-utils'
import { withoutID } from '@/_lib/utils'
import { revalidatePath } from 'next/cache'


export async function saveProduct(product: Product, newTags: UnsavedGroup[], rawCategoryImg: string): Promise<ActionRes> {
  try {
    await checkIfRealAdmin()

    const getPrevProduct = async () => {
      if (productExist) {
        type MinProduct = Pick<Product, RelevantFilterDataKeys | 'tags' | 'imgPath'>
        const projection: Projection<MinProduct, 1> = { imgPath: 1, category: 1, brand: 1, properties: 1, tags: 1 }
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
      if (productExist) {
        const loadImage = product.imgPath.startsWith('data:')
        if (loadImage) {
          const imgLink = await saveProductImage(product._id, product.imgPath)
          product.imgPath = imgLink
          await deleteImages(prevProduct.imgPath)
        }
        try {
          return await Product.findByIdAndUpdate(product._id, withoutID(product))
        } catch (error) {
          throw new ServerSideError('No se pudo actualizar el producto')
        }
      } else {
        const doc = new Product({ product, imgPath: '' })
        const rawImage = product.imgPath
        doc.imgPath = await saveProductImage(doc.id, rawImage)
        await deleteImages(prevProduct.imgPath)
        try {
          return await doc.save()
        } catch (error) {
          throw new ServerSideError('No se pudo crear el producto')
        }
      }
    }

    await Promise.all([
      createOrUpdateProduct(),
      updateFilters(product, prevProduct, rawCategoryImg),
      updateTags(newTags, product.tags, prevProduct.tags)
    ])

    if (product._id.length) {
      return { success: 'Producto actualizado correctamente' }
    } else {
      return { success: 'Producto registrado correctamente' }
    }
  } catch (error) {
    return getErrorMessage(error, 'No se pudo guardar el producto')
  }
}

export async function deleteProduct(_id: string): Promise<ActionRes> {
  try {
    await checkIfRealAdmin()

    const prevProduct = await Product.findById(_id)
    if (!prevProduct) throw new ServerSideError('No se pudo encontrar el producto a eliminar')

    await Promise.all([
      deleteImages(prevProduct.imgPath),
      prevProduct.deleteOne(),
      updateFilters(DEFAULT_PRODUCT, prevProduct, ''),
      updateTags([], [], prevProduct.tags)
    ])

    revalidatePath('/products')

    return { success: 'Producto eliminado correctamente' }
  } catch (error) {
    return getErrorMessage(error, 'No se pudo eliminar el producto')
  }
}

export async function createUser(user: Pick<User, 'name' | 'password'>): Promise<ActionRes> {
  try {
    const userExist = await User.find({ name: user.name })
    if (userExist) throw new ServerSideError(`El usuario "${user.name}" ya existe`)
    await User.create(user)
    return { success: 'Registrado exitosamente' }
  } catch (error) {
    return getErrorMessage(error, 'No se pudo registrar el usuario')
  }
}

/* async function updateCart(
  updater: (cart: SafeUser['cart']) => void,
  { success, defaultError }: Record<'success' | 'defaultError', string>
): Promise<ActionRes> {
  try {
    const res = await getSafeUser()
    if (!res.success) throw new ServerSideError(res.error)
    const user = res.success
    await updater(user.cart)
    await user.save()
    return { success }
  } catch (error) {
    revalidatePath('/product')
    return getErrorMessage(error, defaultError)
  }
} */

/* export async function addToCart(productID: string): Promise<ActionRes> {
  return await updateCart(cart => {
    cart.push(productID)
  }, {
    success: 'Producto agregado al carrito',
    defaultError: 'No se pudo agregar el producto al carrito'
  })
}

export async function removeFromCart(productID: string): Promise<ActionRes> {
  return await updateCart(cart => {
    const index = cart.indexOf(productID)
    if (index == -1) throw new ServerSideError('El producto no se encuentra en la lista de compras')
    cart.splice(index, 1)
  }, {
    success: 'Producto eliminado del carrito',
    defaultError: 'No se pudo eliminar el producto del carrito'
  })
} */