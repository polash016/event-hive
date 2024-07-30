/*
  Warnings:

  - You are about to drop the column `location` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "location";

-- CreateTable
CREATE TABLE "event_location" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "event_location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_location_eventId_key" ON "event_location"("eventId");

-- AddForeignKey
ALTER TABLE "event_location" ADD CONSTRAINT "event_location_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
