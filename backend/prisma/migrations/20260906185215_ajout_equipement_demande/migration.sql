-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "equipementId" INTEGER;

-- CreateIndex
CREATE INDEX "Demande_equipementId_idx" ON "Demande"("equipementId");

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
