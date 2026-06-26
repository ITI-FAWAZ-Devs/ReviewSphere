-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oauth_id" TEXT,
ADD COLUMN     "oauth_provider" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SessionAuditLog" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionAuditLog_pkey" PRIMARY KEY ("id")
);
