/*
  Warnings:

  - Made the column `lastAccess` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "lastAccess" SET NOT NULL,
ALTER COLUMN "lastAccess" SET DEFAULT CURRENT_TIMESTAMP;
