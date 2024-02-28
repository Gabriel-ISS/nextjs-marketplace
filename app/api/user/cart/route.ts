import { GetCartProductsParams } from '@/_lib/data'
import { getCartProducts } from '@/_lib/server-only/data'
import { getParams } from '@/_lib/utils'


export async function GET(req: Request) {
  const { onlyIDs } = getParams<GetCartProductsParams>(req.url)
  const res = await getCartProducts({ onlyIDs })
  return Response.json(res)
}