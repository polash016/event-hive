/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_categories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketPrice` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CONCERT', 'CONFERENCE');

-- DropForeignKey
ALTER TABLE "event_categories" DROP CONSTRAINT "event_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "event_categories" DROP CONSTRAINT "event_categories_eventId_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "category" "EventType" NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ticketPrice" INTEGER NOT NULL,
ADD COLUMN     "type" "EventType" NOT NULL;

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "event_categories";

-- CreateTable
CREATE TABLE "artists" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "genre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "expertise" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artists_eventId_key" ON "artists"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "speakers_eventId_key" ON "speakers"("eventId");

-- AddForeignKey
ALTER TABLE "artists" ADD CONSTRAINT "artists_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speakers" ADD CONSTRAINT "speakers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
