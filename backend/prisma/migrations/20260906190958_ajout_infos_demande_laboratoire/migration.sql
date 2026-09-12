-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "descriptionLaboratoire" TEXT,
ADD COLUMN     "institutionId" INTEGER,
ADD COLUMN     "nomLaboratoire" TEXT;

-- CreateIndex
CREATE INDEX "Demande_institutionId_idx" ON "Demande"("institutionId");
