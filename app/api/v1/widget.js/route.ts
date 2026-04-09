import { widgetSource } from "@/lib/widget-script";

export const runtime = "edge";
export const preferredRegion = "global";

export async function GET(): Promise<Response> {
  return new Response(widgetSource, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
