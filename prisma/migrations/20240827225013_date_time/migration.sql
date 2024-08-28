/*
  Warnings:

  - You are about to drop the column `date` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `events` table. All the data in the column will be lost.
  - Added the required column `dateTime` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "date",
DROP COLUMN "startTime",
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL;
