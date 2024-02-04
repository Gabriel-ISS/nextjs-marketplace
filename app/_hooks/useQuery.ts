import { getQueryObj } from '@/_lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import QueryString from 'qs'
import { useCallback, useMemo } from 'react'

export default function useQuery() {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = useMemo(() => getQueryObj(searchParams.toString()), [searchParams])

  const setQuery = useCallback((newQuery: Query) => {
    replace(`${pathname}?${QueryString.stringify(newQuery)}`)
  }, [searchParams])

  return [query, setQuery] as const
}