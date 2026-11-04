
require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("./src/lib/prisma");

async function main() {
  const nom = process.env.ADMIN_NOM?.trim();
  const prenom = process.env.ADMIN_PRENOM?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!nom || !prenom || !email || !password) {
    throw new Error(
      "Variables requises : ADMIN_NOM, ADMIN_PRENOM, ADMIN_EMAIL et ADMIN_PASSWORD."
    );
  }

  if (password.length < 12) {
    throw new Error("Choisis un mot de passe d'au moins 12 caractères.");
  }

  // Vérifier la base ciblée avant toute création.
  const result = await prisma.$queryRaw`
    SELECT current_database() AS database
  `;

  console.log("Base de données ciblée :", result[0].database);

  if (result[0].database !== "equipement-gestion") {
    throw new Error(
      "Base inattendue : création annulée. Vérifie DATABASE_URL."
    );
  }

  // Ne pas modifier un compte existant.
  const existingUser = await prisma.utilisateur.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error(
      "Cet email existe déjà. Aucun compte n'a été modifié."
    );
  }

  const motDePasse = await bcrypt.hash(password, 10);

  const admin = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      email,
      motDePasse,
      role: "ADMINISTRATEUR",
      statutCompte: "VALIDE",
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      statutCompte: true,
    },
  });

  console.log("Administrateur créé avec succès :");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error("Échec :", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
