import { C_ERROR_TAG, S_ERROR_TAG } from '@/constants';


export class ClientError extends Error {
  constructor(message: string) {
    if (message.startsWith(S_ERROR_TAG)) {
      super(message)
    } else {
      super(C_ERROR_TAG + message)
    }
  }
}

export function fetchRetry(fetcher: () => Promise<any>, interval: number, attempts: number) {
  const id = setInterval(() => {
    fetcher().then(() => clearInterval(id))
  }, interval)
  setTimeout(() => {
    clearInterval(id)
  }, interval * attempts)
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
  return Boolean(user.role && ['admin', 'fake admin'].includes(user.role))
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