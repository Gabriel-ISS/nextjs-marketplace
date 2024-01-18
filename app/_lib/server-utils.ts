import { deleteImages, saveTagImage } from '@/_lib/aws-s3';
import { FilterManager, RelevantFilterData } from '@/_lib/filter-manager';
import { Filter, Group } from '@/_lib/models';
import { ServerSideError } from '@/_lib/utils';
import mongoose from "mongoose";
import { getServerSession } from 'next-auth';
import { Types } from 'mongoose'

const { MONGO_URL } = process.env;

if (!MONGO_URL) throw new ServerSideError("MONGO_URL is not defined.", { send: true });

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  cached.conn = await mongoose.connect(MONGO_URL);

  return cached.conn;
}

export async function checkAuthentication() {
  const user = await getServerSession()
  if (!user) throw new ServerSideError('Usuario no autenticado')
}

export async function updateFilters(product: RelevantFilterData, prevProduct: RelevantFilterData) {
  const getFilter = async (category: string) => {
    const filter = await Filter.findOne({ category })
    if (!filter) throw new ServerSideError(`No se pudo encontrar el filtro a actualizar de categoría "${category}"`)
    return filter
  }

  const updateFilter = async (current: RelevantFilterData, previous: RelevantFilterData) => {
    const filter = await getFilter(current.category)
    return await new FilterManager({ filter }).modify(current, previous).updateDB()
  }

  const CurrentHasCategory = product.category.length
  const PreviousHasCategory = prevProduct.category.length

  // update (depends)
  if (CurrentHasCategory && PreviousHasCategory) {
    // update filter
    if (product.category == prevProduct.category) {
      return await updateFilter(product, prevProduct)
    }
    // update filters
    else {
      return await Promise.all([
        updateFilter(product, prevProduct),
        updateFilter(prevProduct, product)
      ])
    }
  }
  // increase/create
  else if (CurrentHasCategory && !PreviousHasCategory) {
    const filter = await Filter.findOne({ category: product.category })
    // increase
    if (filter) {
      return await new FilterManager({ filter }).increase(product).updateDB()
    }
    // create
    else {
      return await new FilterManager({ product }).updateDB()
    }
  }
  // reduce/remove
  else if (PreviousHasCategory && !CurrentHasCategory) {
    const filter = await getFilter(prevProduct.category)
    return await new FilterManager({ filter }).reduce(prevProduct).updateDB()
  }
  // error
  else {
    throw new ServerSideError('Ninguna de las versiones del producto (anterior y actual) tiene una categoría asociada')
  }
}

export async function updateTags(newGroups: UnsavedGroup[], tags: string[], prevTags: string[]) {
  const separateTags = async () => {
    const existAndSelectedGroups = await Group.find({ name: { $in: tags } })
    const existAndSelected = existAndSelectedGroups.map(g => g.name)

    // Existe y esta seleccionado
    const toIncrease = existAndSelectedGroups.map(g => g.name)
    // Existe, pero no esta seleccionado. Esta en prevFilter
    const reduce = prevTags.filter(t => !existAndSelected.includes(t))

    const reduceGroups = await Group.find({ name: { $in: reduce } })

    const toReduce = reduceGroups.filter(g => g.used > 1).map(g => g.name)
    const _toDelete = reduceGroups.filter(g => g.used <= 1)
    const toDelete = _toDelete.map(g => g.name)
    const toDeleteImages = _toDelete.map(g => g.image)

    return { toReduce, toDelete, toIncrease, toDeleteImages }
  }

  const { toReduce, toDelete, toIncrease, toDeleteImages } = await separateTags()

  await Promise.all(newGroups.map(async g => {
    const id = new Types.ObjectId()
    // @ts-ignore
    g._id = id
    g.image = await saveTagImage(id.inspect(), g.image)
  }))


  type FirstParam<T> = T extends (param: infer U) => any ? U : never
  const operations: FirstParam<typeof Group.bulkWrite> = []

  const query = {
    deleteMany: (tags: string[]): mongoose.mongo.DeleteManyModel => ({
      filter: {
        name: { $in: tags }
      }
    }),
    increase: (tags: string[], incrementValue: 1 | -1): mongoose.mongo.UpdateManyModel => ({
      filter: {
        name: { $in: tags }
      },
      update: {
        $inc: {
          used: incrementValue
        }
      }
    }),
    insert: (group: UnsavedGroup): mongoose.mongo.InsertOneModel => ({
      document: group
    }),
  }

  operations.push({ deleteMany: query.deleteMany(toDelete) })
  operations.push({ updateMany: query.increase(toReduce, -1) })
  operations.push({ updateMany: query.increase(toIncrease, 1) })
  newGroups.forEach(group => operations.push({ insertOne: query.insert(group) }))

  try {
    return Promise.all([
      Group.bulkWrite(operations),
      deleteImages(...toDeleteImages)
    ])
  } catch (error) {
    throw new ServerSideError('Falla al actualizar las etiquetas')
  }
}