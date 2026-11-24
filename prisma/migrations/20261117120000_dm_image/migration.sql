-- AlterTable
ALTER TABLE "Automation" ADD COLUMN     "dmImageUrl" TEXT;

-- CreateTable
CREATE TABLE "DmImage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DmImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DmImage_workspaceId_idx" ON "DmImage"("workspaceId");
