/*
  Warnings:

  - Added the required column `gender` to the `attendees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `organizers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendees" ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "organizers" ADD COLUMN     "gender" "Gender" NOT NULL;
