/*
  Warnings:

  - You are about to drop the column `genre` on the `guests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "guests" DROP COLUMN "genre",
ADD COLUMN     "expertise" TEXT;
