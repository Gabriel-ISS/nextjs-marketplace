import { GetGroupsParams, GetGroupsReturn } from '@/_lib/data'
import { connectDB } from '@/_lib/db'
import { Group } from '@/_lib/models'
import { getErrorMessage } from '@/_lib/server-only/utils'
import { getProductGroups } from '@/_lib/server-only/data'
import { getParams } from '@/_lib/utils'


export async function GET(req: Request) {
  await connectDB()
  const { NC } = getParams<GetGroupsParams>(req.url)
  const res = (NC ? await getProductGroupsNC() : await getProductGroups()) as GetGroupsReturn
  return Response.json(res)
}

async function getProductGroupsNC(): Promise<ActionRes<string[]>> {
  try {
    const groups = await Group.find({}, { name: 1 })
    return { success: groups.map(group => group.name) }
  } catch (error) {
    return getErrorMessage(error, 'Falla al obtener las etiquetas (NC)')
  }
}
