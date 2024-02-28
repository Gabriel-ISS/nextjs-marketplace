import { RevalidatePathParams } from '@/_lib/data';
import { getParams } from '@/_lib/utils';
import { revalidatePath } from 'next/cache';

export function GET(req: Request) {
  const { path } = getParams<RevalidatePathParams>(req.url)
  revalidatePath(path)
  return Response.json({})
}