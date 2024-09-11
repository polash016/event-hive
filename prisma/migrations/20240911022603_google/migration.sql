-- AlterTable
ALTER TABLE "attendees" ALTER COLUMN "contactNumber" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
