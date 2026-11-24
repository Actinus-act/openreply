import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";

type RouteProps = { params: Promise<{ id: string }> };

/**
 * Public, unauthenticated: Instagram (or Zernio) downloads campaign DM images
 * from here when sending them. Ids are unguessable cuids.
 */
export async function GET(_request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const image = await prisma.dmImage.findUnique({
    where: { id: id.replace(/\.(jpe?g|png)$/i, "") },
    select: { mimeType: true, data: true },
  });

  if (!image) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(image.data), {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": String(image.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
