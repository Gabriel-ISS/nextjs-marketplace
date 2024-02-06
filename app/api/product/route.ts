import { DEFAULT_PRODUCT } from '@/_lib/constants'
import { connectDB } from '@/_lib/db'
import { Product } from '@/_lib/models'
import { getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils'


export type GetProductParams = { id?: string }
export type GetProductReturn = ActionRes<Product>
export async function GET(req: Request) {
  await connectDB()
  const { id } = getParams<GetProductParams>(req.url)
  const res: GetProductReturn = await getProduct(id)
  return Response.json(res)
}

export async function getProduct(id?: string): Promise<GetProductReturn> {
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