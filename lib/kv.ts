import { kv as vercelKv } from "@vercel/kv";

export const kv =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN ? vercelKv : null;

