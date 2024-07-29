/*
  Warnings:

  - Added the required column `status` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DELETED', 'UPCOMING', 'ONGOING', 'ENDED');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "status" "EventStatus" NOT NULL;
