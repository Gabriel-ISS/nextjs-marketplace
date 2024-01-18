type ExtraData = { send?: boolean }
export class ServerSideError extends Error {
  constructor(message: string, extraData: ExtraData = {}) {
    if (extraData.send) {
      super('Por favor reporte el error a la empresa.\n' + message)
    } else {
      super(message)
    }
  }
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