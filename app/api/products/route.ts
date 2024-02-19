import { GetProductsReturn } from '@/_lib/data';
import { connectDB } from '@/_lib/db';
import { getProducts } from '@/_lib/server-only/data';


export async function GET(req: Request) {
  await connectDB()
  const query = req.url.split('?')[1]
  const res: GetProductsReturn = await getProducts(query)
  return Response.json(res)
}