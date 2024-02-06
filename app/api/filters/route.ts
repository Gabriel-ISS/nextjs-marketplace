import { connectDB } from '@/_lib/db';
import { Filter } from '@/_lib/models'
import { ServerSideError, getErrorMessage } from '@/_lib/server-utils'
import { getParams } from '@/_lib/utils';


export type GetFiltersParams = { category: string }
export type GetFiltersReturn = ActionRes<FilterForFilters>
export async function GET(req: Request) {
  await connectDB()
  let res: GetFiltersReturn;
  try {
    const { category } = getParams<GetFiltersParams>(req.url)
    if (!category) throw new ServerSideError('Se esta solicitando un filtro pero no se especifico la categoría')
    const filters = await Filter.findOne({ category })
    if (!filters) throw new ServerSideError(`No se encontraron los filtros para la categoría "${category}"`)
    const noCounted: FilterForFilters = {
      category: filters.category,
      brands: filters.brands.map(brand => brand.name),
      properties: filters.properties.map(property => ({
        name: property.name,
        values: property.values.map(value => value.name)
      }))
    }
    res = { success: noCounted }
  } catch (error) {
    res = getErrorMessage(error, 'Falla al obtener los filtros (NC)')
  }
  return Response.json(res)
}