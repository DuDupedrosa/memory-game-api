-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "playerId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);
