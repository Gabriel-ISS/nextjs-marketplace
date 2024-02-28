'use server'

import { deleteImages, saveProductImage } from '@/_lib/aws-s3'
import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { connectDB } from '@/_lib/db'
import { RelevantFilterDataKeys } from '@/_lib/filter-manager'
import { Cart, Product, User } from '@/_lib/models'
import { ServerSideError, checkIfRealAdmin, getErrorMessage, nextAuthOptions, updateFilters, updateTags } from '@/_lib/server-only/utils'
import { withoutID } from '@/_lib/utils'
import { Document } from 'mongoose'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'


export async function saveProduct(product: Product, newTags: UnsavedGroup[], rawCategoryImg: string): Promise<ActionRes> {
  try {
    await connectDB()
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
    await connectDB()
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
    await connectDB()
    const userExist = await User.findOne({ name: user.name })
    if (userExist) throw new ServerSideError(`El usuario "${user.name}" ya existe`)
    await User.create(user)
    return { success: 'Registrado exitosamente' }
  } catch (error) {
    return getErrorMessage(error, 'No se pudo registrar el usuario')
  }
}

async function updateCart(
  updater: (cart: (Cart & Document) | null, userID: string) => void,
  { success, defaultError }: Record<'success' | 'defaultError', string>,
  productID: string
): Promise<ActionRes> {
  try {
    await connectDB()
    const session = await getServerSession(nextAuthOptions)
    if (!session) redirect(`/auth?callbackUrl=${encodeURIComponent(`/product?id=${productID}`)}`)
    const userID = session.user.id
    let cart = await Cart.findOne({ userID })
    await updater(cart, userID)
    return { success }
  } catch (error) {
    return getErrorMessage(error, defaultError)
  } finally {
    revalidatePath('/product')
    revalidatePath('/cart')
  }
}

export async function addToCart(productID: string): Promise<ActionRes | undefined> {
  return await updateCart(async (cart, userID) => {
    const data: Cart['products'][number] = { ID: productID }
    if (cart) {
      cart.products.push(data)
    } else {
      cart = new Cart({
        userID, products: [data]
      })
    }
    await cart.save()
  }, {
    success: 'Producto agregado al carrito',
    defaultError: 'No se pudo agregar el producto al carrito'
  },
    productID
  )
}

export async function removeFromCart(productID: string): Promise<ActionRes | undefined> {
  return await updateCart(async cart => {
    if (!cart) throw new ServerSideError('Carrito no encontrado')
    const index = cart.products.findIndex(p => p.ID == productID)
    if (index == -1) throw new ServerSideError('El producto no se encuentra en la lista de compras')
    cart.products.splice(index, 1)
    await cart.save()
  }, {
    success: 'Producto eliminado del carrito',
    defaultError: 'No se pudo eliminar el producto del carrito'
  },
    productID
  )
}

export async function removeCart(): Promise<ActionRes | void> {
  try {
    await connectDB()
    const session = await getServerSession(nextAuthOptions)
    if (!session) throw new ServerSideError('Su sesión ha expirado')
    await Cart.deleteOne({userID: session.user.id})
    return;
  } catch (error) {
    return getErrorMessage(error, 'No se ha podido vaciar el carrito')
  } finally {
    revalidatePath('/cart')
  }
}