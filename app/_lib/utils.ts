import { ADMIN_ROLES, C_ERROR_TAG, S_ERROR_TAG } from '@/constants';
import QueryString from 'qs';


export class ClientError extends Error {
  constructor(message: string) {
    if (message.startsWith(S_ERROR_TAG)) {
      super(message)
    } else {
      super(C_ERROR_TAG + message)
    }
  }
}

export function getQueryObj(queryString: string): Query {
  if (!queryString.length) return {}
  const q: Query = QueryString.parse(queryString)
  if (q.page) {
    q.page = Number(q.page)
  }
  return q
}

type OptionalRecord<K extends string | number | symbol, T> = { [P in K]?: T; }
type OnlyArrayKeys<O> = Extract<keyof O, { [K in keyof O]: O[K] extends any[] | undefined ? K : never }[keyof O]>

export function checkboxManager<
  Obj extends OptionalRecord<string, any>,
  K extends OnlyArrayKeys<Obj>,
  T extends NonNullable<Obj[K]>[number]
>(query: Obj, key: K, selected: T, isChecked: boolean) {
  const q = query as OptionalRecord<K, T[]>;
  if (isChecked) {
    if (!q[key]) q[key] = [] as unknown as Obj[K]
    q[key]?.push(selected)
  } else {
    if (!q[key]) throw new ClientError('Se intenta eliminar una etiqueta de la consulta, pero no hay etiquetas definidas')
    q[key] = (q[key] as T[]).filter(t => t != selected) as unknown as Obj[K]
    if (!q[key]?.length) delete q[key]
  }
}

export function getParams<T extends Record<string, any>>(url: string): T {
  const search = url.split('?')[1] as string | undefined
  if (!search) return {} as T
  const searchParams = new URLSearchParams(search)
  return Object.fromEntries(searchParams.entries()) as T
}

export function getLocalCurrency(value: number) {
  return new Intl.NumberFormat('es-Py', { style: 'currency', currency: 'PYG' }).format(value)
}

export function getBase64(file: File): Promise<string> {
  return new Promise(function (resolve) {
    var reader = new FileReader();
    reader.onloadend = function () {
      resolve(reader.result as string)
    }
    reader.readAsDataURL(file);
  })
}

export function withoutID<O extends { _id: string }>(obj: O) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => key != '_id')) as Omit<O, '_id'>
}

export function isAdmin(user: SafeUser) {
  return Boolean(user.role && ADMIN_ROLES.includes(user.role))
}

export function clearErrorMessage(errorMessage: string, defaultMessage?: string) {
  if (errorMessage.startsWith(S_ERROR_TAG)) {
    return errorMessage.slice(S_ERROR_TAG.length)
  } else if (errorMessage.startsWith(C_ERROR_TAG)) {
    return errorMessage.slice(C_ERROR_TAG.length)
  }
  if (defaultMessage) {
    if (process.env.NODE_ENV == 'development') console.log(errorMessage)
    return defaultMessage
  }
  return errorMessage
}