require("dotenv").config();

const bcrypt = require("bcrypt");

const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Début du seed...");

  // =========================================================
  // 1. INSTITUTION
  // =========================================================

  const institution = await prisma.institution.create({
    data: {
      nom: "Université de Lomé",
      adresse: "Lomé, Togo",
    },
  });

  // =========================================================
  // 2. LABORATOIRE
  // =========================================================

  const laboratoire = await prisma.laboratoire.create({
    data: {
      nom: "Laboratoire de Recherche en Sciences",
      description: "Laboratoire de recherche scientifique",
      statut: "VALIDE",
      institutionId: institution.id,
    },
  });

  console.log(`🏢 Laboratoire créé : ${laboratoire.nom}`);

  // =========================================================
  // 3. HASH DES MOTS DE PASSE
  // =========================================================

  const motDePasseHash = await bcrypt.hash("Test1234", 10);

  // =========================================================
  // 4. CHERCHEUR
  // =========================================================

  const chercheur = await prisma.utilisateur.create({
    data: {
      nom: "Chercheur",
      prenom: "Test",
      email: "chercheur@test.com",
      motDePasse: motDePasseHash,
      grade: "Chercheur",
      telephone: "+22890000001",
      statutCompte: "VALIDE",
      role: "CHERCHEUR",
      laboratoireId: laboratoire.id,
    },
  });

  // =========================================================
  // 5. RESPONSABLE ÉQUIPEMENT
  // =========================================================

  const responsable = await prisma.utilisateur.create({
    data: {
      nom: "Responsable",
      prenom: "Test",
      email: "responsable@test.com",
      motDePasse: motDePasseHash,
      grade: "Chercheur",
      telephone: "+22890000002",
      statutCompte: "VALIDE",
      role: "RESPONSABLE_EQUIPEMENT",
      laboratoireId: laboratoire.id,
    },
  });

  // =========================================================
  // 6. ADMINISTRATEUR
  // =========================================================

  const administrateur = await prisma.utilisateur.create({
    data: {
      nom: "Administrateur",
      prenom: "Test",
      email: "admin@test.com",
      motDePasse: motDePasseHash,
      grade: "Administrateur",
      telephone: "+22890000003",
      statutCompte: "VALIDE",
      role: "ADMINISTRATEUR",
      laboratoireId: laboratoire.id,
    },
  });

  console.log("👤 Utilisateurs créés");

  // =========================================================
  // 7. PARAMÈTRE ANALYTIQUE
  // =========================================================

  const parametre = await prisma.parametreAnalytique.create({
    data: {
      nom: "pH",
      description: "Mesure du potentiel hydrogène",
    },
  });

  // =========================================================
  // 8. MATRICE
  // =========================================================

  const matrice = await prisma.matrice.create({
    data: {
      nom: "Eau",
      description: "Échantillons d'eau",
    },
  });

  // =========================================================
  // 9. ÉQUIPEMENT
  // =========================================================

  const equipement = await prisma.equipement.create({
    data: {
      nom: "pH-mètre",
      description: "Appareil de mesure du pH",

      caracteristiquesTechniques:
        "Plage de mesure : 0 à 14",

      disponibilite: "INSTALLE_FONCTIONNEL",

      laboratoireId: laboratoire.id,

      // Le responsable@test.com est responsable
      responsableId: responsable.id,

      parametres: {
        create: {
          parametreId: parametre.id,
        },
      },

      matrices: {
        create: {
          matriceId: matrice.id,
        },
      },
    },
  });

  console.log(`🔬 Équipement créé : ${equipement.nom}`);

  // =========================================================
  // 10. AFFICHAGE DES COMPTES
  // =========================================================

  console.log("\n====================================");
  console.log("       COMPTES DE TEST");
  console.log("====================================");

  console.log("\n👨‍🔬 CHERCHEUR");
  console.log("Email       : chercheur@test.com");
  console.log("Mot de passe: Test1234");

  console.log("\n🧑‍🔬 RESPONSABLE ÉQUIPEMENT");
  console.log("Email       : responsable@test.com");
  console.log("Mot de passe: Test1234");

  console.log("\n👨‍💼 ADMINISTRATEUR");
  console.log("Email       : admin@test.com");
  console.log("Mot de passe: Test1234");

  console.log("\n====================================");
  console.log("🌱 Seed terminé avec succès !");
  console.log("====================================");
}

main()
  .catch((error) => {
    console.error("❌ Erreur pendant le seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
