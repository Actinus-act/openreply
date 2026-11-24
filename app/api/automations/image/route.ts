import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getBaseUrl } from "@/lib/env";
import {
  canManageWorkspace,
  getCurrentWorkspaceContext,
} from "@/lib/workspace-access";

// Instagram rejects DM images over 8 MB and only accepts these formats.
const MAX_BYTES = 8 * 1024 * 1024;

function sniffImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "image/png";
  return null;
}

/**
 * Upload the image a campaign sends after its link DM. Returns the public URL
 * Instagram fetches the attachment from; the recipient sees the image itself.
 */
export async function POST(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!canManageWorkspace(context.role)) {
    return NextResponse.json(
      { success: false, error: "Only owners and admins can edit campaigns" },
      { status: 403 }
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "Choose an image file" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: "Image must be 8 MB or smaller" },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = sniffImageType(bytes);
  if (!mimeType) {
    return NextResponse.json(
      { success: false, error: "Use a JPG or PNG image" },
      { status: 400 }
    );
  }

  const image = await prisma.dmImage.create({
    data: { workspaceId: context.workspaceId, mimeType, data: bytes },
    select: { id: true },
  });
  const ext = mimeType === "image/png" ? "png" : "jpg";

  return NextResponse.json(
    { success: true, data: { url: `${getBaseUrl()}/api/media/${image.id}.${ext}` } },
    { status: 201 }
  );
}
