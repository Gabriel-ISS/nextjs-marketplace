import 'server-only';

import { ServerSideError } from '@/_lib/server-utils';
import mongoose from 'mongoose';

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