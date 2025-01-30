-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "guestId" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);
