import { connectDB } from '@/_lib/db'
import { Group } from '@/_lib/models'
import { getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils'


export type GetGroupsParams = { NC?: boolean }
export type GetGroupsReturn<P extends GetGroupsParams = GetGroupsParams> = ActionRes<P['NC'] extends true ? string[] : Group[]>
export async function GET(req: Request) {
  await connectDB()
  const { NC } = getParams<GetGroupsParams>(req.url)
  const res = (NC ? await getProductGroupsNC() : await getProductGroups()) as GetGroupsReturn
  return Response.json(res)
}

export async function getProductGroups(): Promise<ActionRes<Group[]>> {
  try {
    const groups = await Group.find({})
    return { success: groups }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener los grupos de productos')
  }
}

export async function getProductGroupsNC(): Promise<ActionRes<string[]>> {
  try {
    const groups = await Group.find({}, { name: 1 })
    return { success: groups.map(group => group.name) }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las etiquetas (NC)')
  }
}
