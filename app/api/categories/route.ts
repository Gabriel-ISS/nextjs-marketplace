import { Filter } from '@/_lib/models'
import { getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils'

async function getCategories(): Promise<ActionRes<string[]>> {
  try {
    const categoriesContainers = await Filter.find({}, { category: 1 })
    return { success: categoriesContainers.map(obj => obj.category) }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las categorías')
  }
}

async function getCategoriesWithImage(): Promise<ActionRes<{ name: string, image: string }[]>> {
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

export type Params = { includeImages?: boolean }
export async function GET(req: Request) {
  const { includeImages } = getParams<Params>(req.url)
  const res = includeImages ? await getCategoriesWithImage() : await getCategories()
  return Response.json(res)
}