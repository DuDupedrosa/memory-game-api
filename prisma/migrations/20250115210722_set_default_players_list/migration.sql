-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "players" TEXT[] DEFAULT ARRAY[]::TEXT[];
