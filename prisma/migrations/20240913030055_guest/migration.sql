/*
  Warnings:

  - You are about to drop the column `categoryId` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `artists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `speakers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "artists" DROP CONSTRAINT "artists_eventId_fkey";

-- DropForeignKey
ALTER TABLE "speakers" DROP CONSTRAINT "speakers_eventId_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "categoryId",
DROP COLUMN "type";

-- DropTable
DROP TABLE "artists";

-- DropTable
DROP TABLE "speakers";

-- DropEnum
DROP TYPE "EventType";

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "genre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guests_eventId_key" ON "guests"("eventId");

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
