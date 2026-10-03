-- CreateEnum
CREATE TYPE "StatutFact" AS ENUM ('BROUILLON', 'PUBLIE', 'ARCHIVE');

-- CreateTable
CREATE TABLE "Fact" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "modele3D" TEXT NOT NULL,
    "imageCouverture" TEXT,
    "statut" "StatutFact" NOT NULL DEFAULT 'BROUILLON',
    "auteurId" INTEGER,
    "categorieId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fact_auteurId_idx" ON "Fact"("auteurId");

-- CreateIndex
CREATE INDEX "Fact_categorieId_idx" ON "Fact"("categorieId");

-- CreateIndex
CREATE INDEX "Fact_statut_idx" ON "Fact"("statut");

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
