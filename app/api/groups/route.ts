import { GetGroupsParams, GetGroupsReturn } from '@/_lib/data'
import { connectDB } from '@/_lib/db'
import { Group } from '@/_lib/models'
import { getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils'


export async function GET(req: Request) {
  await connectDB()
  const { NC } = getParams<GetGroupsParams>(req.url)
  const res = (NC ? await getProductGroupsNC() : await getProductGroups()) as GetGroupsReturn
  return Response.json(res)
}

async function getProductGroups(): Promise<ActionRes<Group[]>> {
  try {
    const groups = await Group.find({})
    return { success: groups }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener los grupos de productos')
  }
}

async function getProductGroupsNC(): Promise<ActionRes<string[]>> {
  try {
    const groups = await Group.find({}, { name: 1 })
    return { success: groups.map(group => group.name) }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las etiquetas (NC)')
  }
}
