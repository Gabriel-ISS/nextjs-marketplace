import { connectDB } from '@/_lib/db'
import { getSafeUser } from '@/_lib/server-utils'


export async function GET(_req: Request) {
  await connectDB()
  const res = await getSafeUser()
  return Response.json(res)
}