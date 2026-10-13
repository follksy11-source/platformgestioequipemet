-- AlterTable
ALTER TABLE "Laboratoire" ADD COLUMN     "localisation" TEXT;

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "fichierPdf" TEXT,
ADD COLUMN     "nomFichierPdf" TEXT;
