-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'AWAITING_VERIFICATION';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "rejectedReason" TEXT,
ADD COLUMN     "slipSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "slipUrl" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedByUserId" TEXT;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "promptpayId" TEXT;
