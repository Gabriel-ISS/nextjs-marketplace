import { CategoryWithImage, GetCategoriesParams, GetCategoriesReturn } from '@/_lib/data'
import { connectDB } from '@/_lib/db'
import { Filter } from '@/_lib/models'
import { getCategoriesWithImage, getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils'


export async function GET(req: Request) {
  await connectDB()
  const { includeImages } = getParams<GetCategoriesParams>(req.url)
  const res = (includeImages ? await getCategoriesWithImage() : await getCategories()) as GetCategoriesReturn
  return Response.json(res)
}

async function getCategories(): Promise<ActionRes<string[]>> {
  try {
    const categoriesContainers = await Filter.find({}, { category: 1 })
    return { success: categoriesContainers.map(obj => obj.category) }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las categorías')
  }
}