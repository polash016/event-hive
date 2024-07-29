/*
  Warnings:

  - You are about to drop the column `organizerEmail` on the `events` table. All the data in the column will be lost.
  - Added the required column `organizerId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_organizerEmail_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "organizerEmail",
ADD COLUMN     "organizerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
