-- AlterEnum
ALTER TYPE "TypeDemande" ADD VALUE 'REJOINDRE_LABORATOIRE';

-- DropForeignKey
ALTER TABLE "Utilisateur" DROP CONSTRAINT "Utilisateur_laboratoireId_fkey";

-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "laboratoireId" INTEGER;

-- AlterTable
ALTER TABLE "Utilisateur" ALTER COLUMN "laboratoireId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Demande_laboratoireId_idx" ON "Demande"("laboratoireId");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_laboratoireId_fkey" FOREIGN KEY ("laboratoireId") REFERENCES "Laboratoire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_laboratoireId_fkey" FOREIGN KEY ("laboratoireId") REFERENCES "Laboratoire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
