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
  commonProperties: {
    name: string
    values: string[]
  }[]
}

type NewFilters = Omit<FilterNoCounted, 'brands'> & {
  brand: string
  tags: Omit<Group, '_id'| 'used'>[]
}

/** Product Filter Data */
type PFData = Omit<FilterNoCounted, 'brands'> & {
  brand: string
  tags: string[]
}

type DataState<T> = {
  data: T
  isLoading: boolean
}