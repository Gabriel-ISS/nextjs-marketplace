import 'server-only';

import { ServerSideError } from '@/_lib/server-only/utils';
import mongoose from 'mongoose';

const { MONGO_URL, MONGO_DB_NAME } = process.env;

if (!MONGO_URL) throw new ServerSideError("MONGO_URL is not defined.", { send: true });
if (!MONGO_DB_NAME) throw new ServerSideError("MONGO_DB_NAME is not defined.", { send: true });

type Connection = {
  conn: null | typeof mongoose
}
let cached = (global as any).mongoose as Connection;

if (!cached) {
  cached = (global as any).mongoose = { conn: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  cached.conn = await mongoose.connect(MONGO_URL, { dbName: MONGO_DB_NAME });

  return cached.conn;
}