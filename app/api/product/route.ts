import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { Product } from '@/_lib/models'
import { getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils'

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

export type Params = { id?: string }
export async function GET(req: Request) {
  const { id } = getParams<Params>(req.url)
  const res = await getProduct(id)
  return Response.json(res)
}