import { StateUpdater } from '@/_hooks/useWritableState'
import { getCategories, getCategoryFilters, getProductGroups } from '@/_lib/data'
import { ImmerSet, Slice } from '@/_store/useStore'
import { Draft } from 'immer'


export type FilterSlice = {
  filters: {
    categories: Filter<string[]>
    categoryFilters: Filter<FilterForFilters, [category: string]> & { clear: () => void }
    tags: Filter<string[]>
  }
}

const filterSlice: Slice<FilterSlice> = (set) => ({
  filters: {
    categories: filterInitializer(set, 'categories', [] as string[], getCategories),
    categoryFilters: {
      ...filterInitializer(set, 'categoryFilters', {
        category: '',
        brands: [],
        properties: []
      } as FilterForFilters, getCategoryFilters),
      clear() {
        set(prev => {
          prev.filters.categoryFilters.state.data = {
            category: '',
            brands: [],
            properties: []
          }
        })
      }
    },
    tags: filterInitializer(set, 'tags', [] as string[], () => getProductGroups({ NC: true })),
  }
})

export default filterSlice



type Filter<T, Params extends [...args: any] = []> = {
  state: DataState<T>
  setter: StateUpdater<T>
  load(...args: Params): void
  setLoading(loading: boolean): void
}

type Filters = FilterSlice['filters']

const filterInitializer = <
  FilterKey extends keyof Filters,
  T extends Filters[FilterKey]['state']['data'],
  Fetcher extends (...args: any) => Promise<ActionRes<any>>
>(
  set: ImmerSet,
  filterKey: FilterKey,
  initialState: T,
  fetcher: Fetcher
): Filter<T, Parameters<Fetcher>> => ({
  state: {
    data: initialState,
    isLoading: false
  },
  setter(updater) {
    set(prev => {
      updater(prev.filters[filterKey].state.data as Draft<T>)
    })
  },
  async load(...args) {
    set(prev => { prev.filters[filterKey].state.isLoading = true })
    const res = await fetcher(...args)
    set(prev => {
      const FState = prev.filters[filterKey].state
      if (!res.success) {
        FState.error = res.error
        FState.isLoading = false
        return;
      }
      FState.data = res.success
      FState.isLoading = false
      delete FState.error
    })
  },
  setLoading(loading) {
    set(prev => {
      prev.filters.categories.state.isLoading = loading
    })
  },
})