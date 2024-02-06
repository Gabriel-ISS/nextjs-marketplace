import { Produce, StateUpdater } from '@/_hooks/useWritableState'
import { getCategories, getCategoryFilters, getProductGroups } from '@/_lib/data'
import { fetchRetry } from '@/_lib/utils'
import { ImmerSet, Slice } from '@/_store/useStore'
import { Draft } from 'immer'
import QueryString from 'qs'


export type FilterSlice = {
  filters: {
    categories: Filter<string[]>
    categoryFilters: Filter<FilterForFilters, [category: string]> & { clear: () => void }
    tags: Filter<string[]>
  }
  query: {
    data: Query
    wasEstablished: boolean
    setter(setQuery: Produce<Query> | Query, resetPage?: boolean): void
    setFromString(query: string): void
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
    tags: filterInitializer(set, 'tags', [] as string[], () => getProductGroups({NC: true})),
  },
  query: {
    data: {},
    wasEstablished: false,
    setter(updater, resetPage = true) {
      set(prev => {
        if (typeof updater == 'function') {
          updater(prev.query.data)
          prev.query.wasEstablished = true
          if (resetPage) delete prev.query.data.page
        } else {
          prev.query.data = updater
        }
      })
    },
    setFromString(query) {
      set(prev => {
        prev.query.data = QueryString.parse(query)
        const q = prev.query.data
        if (q.page) {
          q.page = Number(q.page)
        }
        prev.query.wasEstablished = true
      })
    }
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

    fetchRetry(_load, 500, 3)

    async function _load() {
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
    }
  },
  setLoading(loading) {
    set(prev => {
      prev.filters.categories.state.isLoading = loading
    })
  },
})