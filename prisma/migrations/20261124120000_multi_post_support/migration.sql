-- AlterTable
ALTER TABLE "Automation" ADD COLUMN "postIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Automation" ADD COLUMN "postUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill existing single postId/postUrl into postIds/postUrls if not empty
UPDATE "Automation"
SET "postIds" = ARRAY["postId"]
WHERE "postId" IS NOT NULL AND (cardinality("postIds") IS NULL OR cardinality("postIds") = 0);

UPDATE "Automation"
SET "postUrls" = ARRAY["postUrl"]
WHERE "postUrl" IS NOT NULL AND (cardinality("postUrls") IS NULL OR cardinality("postUrls") = 0);

-- Create GIN Index for fast array lookup
CREATE INDEX IF NOT EXISTS "Automation_postIds_idx" ON "Automation" USING GIN ("postIds");
