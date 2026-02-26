-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "category" TEXT,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "technicalSummary" TEXT,
ALTER COLUMN "location" DROP NOT NULL;
