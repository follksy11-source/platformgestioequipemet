-- CreateEnum
CREATE TYPE "StatutCompte" AS ENUM ('EN_ATTENTE', 'VALIDE', 'BLOQUE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CHERCHEUR', 'RESPONSABLE_EQUIPEMENT', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "StatutLaboratoire" AS ENUM ('EN_ATTENTE', 'VALIDE');

-- CreateEnum
CREATE TYPE "DisponibiliteEquipement" AS ENUM ('INSTALLE_FONCTIONNEL', 'PRESENT_NON_INSTALLE', 'EN_COURS_DE_LIVRAISON', 'PROJET_EN_COURS');

-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'ANNULEE', 'TERMINEE');

-- CreateEnum
CREATE TYPE "TypeDemande" AS ENUM ('AJOUT_LABORATOIRE', 'DEVENIR_RESPONSABLE');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "TypePublication" AS ENUM ('ARTICLE', 'ANNONCE', 'APPEL_A_PROJET', 'APPEL_A_CANDIDATURE');

-- CreateEnum
CREATE TYPE "StatutPublication" AS ENUM ('BROUILLON', 'PUBLIEE', 'ARCHIVEE');

-- CreateEnum
CREATE TYPE "StatutCommentaire" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "StatutRapport" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "StatutMessage" AS ENUM ('ENVOYE', 'LU');

-- CreateTable
CREATE TABLE "Institution" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratoire" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "statut" "StatutLaboratoire" NOT NULL DEFAULT 'EN_ATTENTE',
    "institutionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laboratoire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "grade" TEXT,
    "telephone" TEXT,
    "statutCompte" "StatutCompte" NOT NULL DEFAULT 'EN_ATTENTE',
    "role" "Role" NOT NULL DEFAULT 'CHERCHEUR',
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "laboratoireId" INTEGER NOT NULL,
    "laboratoireDirigeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipement" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "caracteristiquesTechniques" TEXT,
    "photo" TEXT,
    "disponibilite" "DisponibiliteEquipement" NOT NULL,
    "laboratoireId" INTEGER NOT NULL,
    "responsableId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParametreAnalytique" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParametreAnalytique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipementParametre" (
    "equipementId" INTEGER NOT NULL,
    "parametreId" INTEGER NOT NULL,

    CONSTRAINT "EquipementParametre_pkey" PRIMARY KEY ("equipementId","parametreId")
);

-- CreateTable
CREATE TABLE "Matrice" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipementMatrice" (
    "equipementId" INTEGER NOT NULL,
    "matriceId" INTEGER NOT NULL,

    CONSTRAINT "EquipementMatrice_pkey" PRIMARY KEY ("equipementId","matriceId")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "statut" "StatutReservation" NOT NULL DEFAULT 'EN_ATTENTE',
    "utilisateurId" INTEGER NOT NULL,
    "equipementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demande" (
    "id" SERIAL NOT NULL,
    "type" "TypeDemande" NOT NULL,
    "contenuDemande" TEXT,
    "statut" "StatutDemande" NOT NULL DEFAULT 'EN_ATTENTE',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "type" "TypePublication" NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "image" TEXT,
    "statut" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auteurId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutMessage" NOT NULL DEFAULT 'ENVOYE',
    "expediteurId" INTEGER NOT NULL,
    "destinataireId" INTEGER NOT NULL,
    "equipementId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commentaire" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutCommentaire" NOT NULL DEFAULT 'EN_ATTENTE',
    "auteurId" INTEGER NOT NULL,
    "equipementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commentaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rapport" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutRapport" NOT NULL DEFAULT 'EN_ATTENTE',
    "auteurId" INTEGER NOT NULL,
    "equipementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rapport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravailRecherche" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "equipementId" INTEGER NOT NULL,
    "auteurId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravailRecherche_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Laboratoire_institutionId_idx" ON "Laboratoire"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_laboratoireDirigeId_key" ON "Utilisateur"("laboratoireDirigeId");

-- CreateIndex
CREATE INDEX "Equipement_laboratoireId_idx" ON "Equipement"("laboratoireId");

-- CreateIndex
CREATE INDEX "Equipement_responsableId_idx" ON "Equipement"("responsableId");

-- CreateIndex
CREATE INDEX "Reservation_utilisateurId_idx" ON "Reservation"("utilisateurId");

-- CreateIndex
CREATE INDEX "Reservation_equipementId_idx" ON "Reservation"("equipementId");

-- CreateIndex
CREATE INDEX "Reservation_dateDebut_dateFin_idx" ON "Reservation"("dateDebut", "dateFin");

-- CreateIndex
CREATE INDEX "Demande_utilisateurId_idx" ON "Demande"("utilisateurId");

-- CreateIndex
CREATE INDEX "Publication_auteurId_idx" ON "Publication"("auteurId");

-- CreateIndex
CREATE INDEX "Message_expediteurId_idx" ON "Message"("expediteurId");

-- CreateIndex
CREATE INDEX "Message_destinataireId_idx" ON "Message"("destinataireId");

-- CreateIndex
CREATE INDEX "Message_equipementId_idx" ON "Message"("equipementId");

-- CreateIndex
CREATE INDEX "Commentaire_auteurId_idx" ON "Commentaire"("auteurId");

-- CreateIndex
CREATE INDEX "Commentaire_equipementId_idx" ON "Commentaire"("equipementId");

-- CreateIndex
CREATE INDEX "Rapport_auteurId_idx" ON "Rapport"("auteurId");

-- CreateIndex
CREATE INDEX "Rapport_equipementId_idx" ON "Rapport"("equipementId");

-- CreateIndex
CREATE INDEX "TravailRecherche_equipementId_idx" ON "TravailRecherche"("equipementId");

-- CreateIndex
CREATE INDEX "TravailRecherche_auteurId_idx" ON "TravailRecherche"("auteurId");

-- AddForeignKey
ALTER TABLE "Laboratoire" ADD CONSTRAINT "Laboratoire_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_laboratoireId_fkey" FOREIGN KEY ("laboratoireId") REFERENCES "Laboratoire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_laboratoireDirigeId_fkey" FOREIGN KEY ("laboratoireDirigeId") REFERENCES "Laboratoire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipement" ADD CONSTRAINT "Equipement_laboratoireId_fkey" FOREIGN KEY ("laboratoireId") REFERENCES "Laboratoire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipement" ADD CONSTRAINT "Equipement_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipementParametre" ADD CONSTRAINT "EquipementParametre_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipementParametre" ADD CONSTRAINT "EquipementParametre_parametreId_fkey" FOREIGN KEY ("parametreId") REFERENCES "ParametreAnalytique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipementMatrice" ADD CONSTRAINT "EquipementMatrice_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipementMatrice" ADD CONSTRAINT "EquipementMatrice_matriceId_fkey" FOREIGN KEY ("matriceId") REFERENCES "Matrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravailRecherche" ADD CONSTRAINT "TravailRecherche_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravailRecherche" ADD CONSTRAINT "TravailRecherche_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
