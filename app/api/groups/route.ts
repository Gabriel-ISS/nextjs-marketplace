import { Group } from '@/_lib/models'
import { getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils'

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

export type GetGroupsParams = { NC: boolean }
export async function GET(req: Request) {
  const { NC } = getParams(req.url)
  const res = NC ? await getProductGroupsNC() : await getProductGroups()
  return Response.json(res)
}