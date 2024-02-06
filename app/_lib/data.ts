/* import axios from 'axios'

const market = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_HOST}/api`
}) */

type GetOptions = {
  params?: any
}

function get<T>(path: string, options?: GetOptions): Promise<T> {
  let query = ''
  if (options?.params) {
    query = '?' + new URLSearchParams(options.params).toString()
  }
  return fetch(`${process.env.NEXT_PUBLIC_HOST}/api${path}${query}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(res => res.json())
}

export type GetGroupsParams = { NC?: boolean }
export type GetGroupsReturn<P extends GetGroupsParams = GetGroupsParams> = ActionRes<P['NC'] extends true ? string[] : Group[]>
export async function getProductGroups<P extends GetGroupsParams>(params?: P) {
  return (await get<GetGroupsReturn<P>>('/groups', { params }))
}

export type GetCategoriesParams = { includeImages?: boolean }
export type GetCategoriesReturn<P extends GetCategoriesParams = GetCategoriesParams> = ActionRes<P['includeImages'] extends true ? CategoryWithImage[] : string[]>
export async function getCategories<P extends GetCategoriesParams>(params?: P) {
  return (await get<GetCategoriesReturn<P>>('/categories', { params }))
}

export type CategoryWithImage = { name: string, image: string }
export type GetFiltersParams = { category: string }
export type GetFiltersReturn = ActionRes<FilterForFilters>
export async function getCategoryFilters(category: string) {
  const params: GetFiltersParams = { category }
  return (await get<GetFiltersReturn>('/filters', { params }))
}

type ProductsAndPages = { products: Product[], totalPages: number }
export type GetProductsReturn = ActionRes<ProductsAndPages>
export async function getProducts(queryString: string) {
  return (await get<GetProductsReturn>(`/products?${queryString}`))
}

export type GetProductParams = { id?: string }
export type GetProductReturn = ActionRes<Product>
export async function getProduct(id?: string) {
  const params: GetProductParams = { id }
  return (await get<GetProductReturn>('/product', { params }))
}