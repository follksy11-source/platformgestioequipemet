/*
  Warnings:

  - You are about to drop the column `auteurId` on the `Fact` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Fact" DROP CONSTRAINT "Fact_auteurId_fkey";

-- DropIndex
DROP INDEX "Fact_auteurId_idx";

-- AlterTable
ALTER TABLE "Fact" DROP COLUMN "auteurId";
