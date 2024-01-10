type PageProps = {
  params: Record<string, string | undefined>
  searchParams: Record<string, string | undefined>
}

type Query = Partial<Pick<FilterNoCounted, 'category' | 'brands'>> & {
  properties?: {
    [name: string]: string[]
  }
  tags?: string[]

  search?: string
  page?: number
}

type FilterNoCounted = {
  category: string
  brands: string[]
} & Pick<Product, 'properties'>

type NewFilters = Omit<FilterNoCounted, 'brands'> & {
  tags: UnsavedGroup[]
} & Pick<Product, 'brand'>

/** Product Filter Data */
type PFData = Omit<FilterNoCounted, 'brands'> & {
  brand: string
  tags: string[]
}

type DataState<T> = {
  data: T
  isLoading: boolean
}

type Projection<T, N extends 1 | -1> = { [key in keyof T]: N }