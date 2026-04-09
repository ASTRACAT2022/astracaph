import { handleVerifyOptions, handleVerifyPost } from "@/lib/verify-handler";

export const runtime = "edge";
export const preferredRegion = "global";

export async function OPTIONS(request: Request): Promise<Response> {
  return handleVerifyOptions(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleVerifyPost(request, "/public/api/v1/verify");
}
