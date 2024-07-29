-- CreateTable
CREATE TABLE "event_images" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_images" ADD CONSTRAINT "event_images_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
