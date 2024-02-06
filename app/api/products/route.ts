import { GetProductsReturn } from '@/_lib/data';
import { connectDB } from '@/_lib/db';
import { Product } from '@/_lib/models';
import { getErrorMessage } from '@/_lib/server-utils';
import { FilterQuery } from 'mongoose';
import QueryString from 'qs';


export async function GET(req: Request) {
  await connectDB()
  const query = req.url.split('?')[1]
  const res: GetProductsReturn = await getProducts(query)
  return Response.json(res)
}

async function getProducts(queryString: string | undefined): Promise<GetProductsReturn> {
  try {
    const LIMIT_PER_PAGE = 3 * 4;
    let page = 1
    let mongoQuery: FilterQuery<Product> = {}
    if (queryString && queryString.length) {
      const query = QueryString.parse(queryString) as unknown as Query

      if (query.page) page = query.page

      if (query.search) mongoQuery.name = { $regex: RegExp(query.search, 'i') }

      if (query.category) mongoQuery.category = query.category

      if (query.brands) mongoQuery.brand = { $in: query.brands }

      if (query.properties) {
        mongoQuery.$and = []
        Object.entries(query.properties).forEach(([name, values]) => {
          mongoQuery.$and?.push({
            $and: [
              { 'properties.name': name },
              { 'properties.values': { $in: values } }
            ]
          })
        })
      }

      if (query.tags) mongoQuery.tags = { $in: query.tags }
    }

    const count = await Product.countDocuments(mongoQuery)
    const totalPages = Math.ceil(count / LIMIT_PER_PAGE)
    const products = await Product.find(mongoQuery).limit(LIMIT_PER_PAGE).skip(LIMIT_PER_PAGE * (page - 1))
    return {
      success: JSON.parse(JSON.stringify({ products, totalPages }))
    }
  } catch (error) {
    return getErrorMessage(error, 'Fallo al obtener los productos')
  }
}