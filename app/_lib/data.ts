import axios from 'axios'


axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_HOST}/api`

export type GetGroupsParams = { NC?: boolean }
export type GetGroupsReturn<P extends GetGroupsParams = GetGroupsParams> = ActionRes<P['NC'] extends true ? string[] : Group[]>
export async function getProductGroups<P extends GetGroupsParams>(params?: P) {
  return (await axios.get<GetGroupsReturn<P>>('/groups', { params })).data
}

export type GetCategoriesParams = { includeImages?: boolean }
export type GetCategoriesReturn<P extends GetCategoriesParams = GetCategoriesParams> = ActionRes<P['includeImages'] extends true ? CategoryWithImage[] : string[]>
export async function getCategories<P extends GetCategoriesParams>(params?: P) {
  return (await axios.get<GetCategoriesReturn<P>>('/categories', { params })).data
}

export type CategoryWithImage = { name: string, image: string }
export type GetFiltersParams = { category: string }
export type GetFiltersReturn = ActionRes<FilterForFilters>
export async function getCategoryFilters(category: string) {
  const params: GetFiltersParams = { category }
  return (await axios.get<GetFiltersReturn>('/filters', { params })).data
}

type ProductsAndPages = { products: Product[], totalPages: number }
export type GetProductsReturn = ActionRes<ProductsAndPages>
export async function getProducts(queryString: string) {
  return (await axios.get<GetProductsReturn>(`/products?${queryString}`)).data
}

export type GetProductParams = { id?: string }
export type GetProductReturn = ActionRes<Product>
export async function getProduct(id?: string) {
  const params: GetProductParams = { id }
  return (await axios.get<GetProductReturn>('/product', { params })).data
}