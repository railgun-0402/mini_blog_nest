-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "CompanyAnalyses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "overview" TEXT,
    "businessChallenges" TEXT,
    "managementPolicy" TEXT,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAnalyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyAnalyses_companyId_idx" ON "CompanyAnalyses"("companyId");

-- AddForeignKey
ALTER TABLE "CompanyAnalyses" ADD CONSTRAINT "CompanyAnalyses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
