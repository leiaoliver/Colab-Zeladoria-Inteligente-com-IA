/*
  Warnings:

  - You are about to drop the column `category` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `technicalResume` on the `Report` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "category",
DROP COLUMN "location",
DROP COLUMN "priority",
DROP COLUMN "technicalResume",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
