import { connectDB } from '@/_lib/db'
import { Filter } from '@/_lib/models'
import { getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils'


export type GetCategoriesParams = { includeImages?: boolean }
export type GetCategoriesReturn<P extends GetCategoriesParams = GetCategoriesParams> = ActionRes<P['includeImages'] extends true ? CategoryWithImage[] : string[]>
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

type CategoryWithImage = { name: string, image: string }
async function getCategoriesWithImage(): Promise<ActionRes<CategoryWithImage[]>> {
  try {
    const categoriesContainers = await Filter.find({}, { category: 1, category_img: 1 })
    return {
      success: categoriesContainers.map(obj => ({
        name: obj.category,
        image: obj.category_img
      }))
    }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las categorías')
  }
}