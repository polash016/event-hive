/*
  Warnings:

  - A unique constraint covering the columns `[organizerId]` on the table `events` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "events_organizerId_key" ON "events"("organizerId");
