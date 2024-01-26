type PageProps = {
  params: Record<string, string | undefined>
  searchParams: Record<string, string | undefined>
}

type Query = Partial<Pick<FilterForFilters, 'category' | 'brands'>> & {
  properties?: {
    [name: string]: string[]
  }
  tags?: string[]

  search?: string
  page?: number
}

type ActionRes<T = string> = {
  success?: undefined
  error: string
} | {
  success: T
  error?: undefined
}

type SuccessRes<T> = NonNullable<Awaited<ReturnType<T>>['success']>

type FilterForFilters = {
  category: string
  brands: string[]
} & Pick<Product, 'properties'>

type NewFilters = Omit<FilterForFilters, 'brands'> & {
  category_img: string
  tags: UnsavedGroup[]
} & Pick<Product, 'brand'>

/** Product Filter Data */
type PFData = Omit<FilterForFilters, 'brands'> & {
  brand: string
  tags: string[]
}

type DataState<T> = {
  data: T
  isLoading: boolean
  error?: string
}

type Projection<T, N extends 1 | -1> = { [key in keyof T]: N }