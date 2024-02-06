import { GetCategoriesParams, GetCategoriesReturn } from '@/api/categories/route'
import { GetFiltersParams, GetFiltersReturn } from '@/api/filters/route'
import { GetGroupsParams, GetGroupsReturn } from '@/api/groups/route'
import { GetProductParams, GetProductReturn } from '@/api/product/route'
import { GetProductsReturn } from '@/api/products/route'
import axios from 'axios'

axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_HOST}/api`

export async function getProductGroups<P extends GetGroupsParams>(params?: P) {
  return (await axios.get<GetGroupsReturn<P>>('/groups', { params })).data
}

export async function getCategories<P extends GetCategoriesParams>(params?: P) {
  return (await axios.get<GetCategoriesReturn<P>>('/categories', { params })).data
}

export async function getCategoryFilters(category: string) {
  const params: GetFiltersParams = { category }
  return (await axios.get<GetFiltersReturn>('/filters', { params })).data
}

export async function getProducts(queryString: string) {
  return (await axios.get<GetProductsReturn>(`/products?${queryString}`)).data
}

export async function getProduct(id?: string) {
  const params: GetProductParams = { id }
  return (await axios.get<GetProductReturn>('/product', { params })).data
}