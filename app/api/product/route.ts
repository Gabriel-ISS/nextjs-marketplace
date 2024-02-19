import { GetProductParams, GetProductReturn } from '@/_lib/data'
import { connectDB } from '@/_lib/db'
import { getProduct } from '@/_lib/server-only/data'
import { getParams } from '@/_lib/utils'


export async function GET(req: Request) {
  await connectDB()
  const { id } = getParams<GetProductParams>(req.url)
  const res: GetProductReturn = await getProduct(id)
  return Response.json(res)
}