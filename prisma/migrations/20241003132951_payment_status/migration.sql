/*
  Warnings:

  - The `paymentStatus` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'Pending';

-- DropEnum
DROP TYPE "PaymentStatus";
