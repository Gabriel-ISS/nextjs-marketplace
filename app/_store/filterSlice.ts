import { StateUpdater } from '@/_hooks/useWritableState'
import { getCategories, getCategoryFiltersNC } from '@/_lib/data'
import { getProductTagsNC } from '@/_lib/data'
import { ImmerSet, Slice } from '@/_store/useStore'
import QueryString from 'qs'


type Filter<T, Loader = () => void> = {
  state: DataState<T>
  load: Loader
  setter: StateUpdater<T>
}

export type FilterSlice = {
  filters: {
    categories: Filter<string[]>
    categoryFilters: Filter<FilterNoCounted, (category: string) => void> & { clear: () => void }
    tags: Filter<string[]>
  }
  query: {
    data: Query
    setter: StateUpdater<Query>
    setFromString(query: string): void 
    setTag(tag: string): void
  }
}

const defaultCategoryFilters = {
  category: '',
  brands: [],
  commonProperties: []
}

const filterSlice: Slice<FilterSlice> = (set) => ({
  filters: {
    categories: {
      state: {
        data: [],
        isLoading: false
      },
      load() {
        loader(set, 'categories', getCategories)
      },
      setter(updater) {
        set(prev => {
          updater(prev.filters.categories.state.data)
        })
      },
    },
    categoryFilters: {
      state: {
        data: defaultCategoryFilters,
        isLoading: false
      },
      load(category) {
        loader(set, 'categoryFilters', () => getCategoryFiltersNC(category))
      },
      setter(updater) {
        set(prev => {
          updater(prev.filters.categoryFilters.state.data)
        })
      },
      clear() {
        set(prev => {
          prev.filters.categoryFilters.state.data = {
            category: '',
            brands: [],
            commonProperties: []
          }
        })
      }
    },
    tags: {
      state: {
        data: [],
        isLoading: false
      },
      load() {
        loader(set, 'tags', getProductTagsNC)
      },
      setter(updater) {
        set(prev => {
          updater(prev.filters.tags.state.data)
        })
      }
    }
  },
  query: {
    data: {},
    setter(setQuery) {
      set(prev => {
        setQuery(prev.query.data)
      })
    },
    setFromString(query) {
      set(prev => {
        prev.query.data = QueryString.parse(query)
      })
    },
    setTag(tag) {
      set(prev => {
        prev.query.data = {}
        prev.query.data.tags = [tag]
      })
    }
  }
})

export default filterSlice

async function loader<Filter extends keyof FilterSlice['filters']>(
  set: ImmerSet,
  filter: Filter,
  fetcher: () => Promise<FilterSlice['filters'][Filter]['state']['data']>
) {
  // for some reason without this promise fetcher promise doesn't work, check in data.ts
  await new Promise<void>(resolve => resolve())
  set(prev => { prev.filters[filter].state.isLoading = true })
  const data = await fetcher()
  set(prev => {
    prev.filters[filter].state.data = data
    prev.filters[filter].state.isLoading = false
  })
}