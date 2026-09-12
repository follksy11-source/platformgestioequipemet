const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");


// ======================================================
// INSCRIPTION
// ======================================================

const register = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      motDePasse,
      laboratoireId
    } = req.body;

    // Vérification des champs obligatoires
    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({
        message: "Nom, prénom, email et mot de passe sont obligatoires"
      });
    }

    // Vérifier si l'email existe déjà
    const utilisateurExiste = await prisma.utilisateur.findUnique({
      where: { email }
    });

    if (utilisateurExiste) {
      return res.status(409).json({
        message: "Cette adresse email est déjà utilisée"
      });
    }

    // Si un laboratoire est fourni, vérifier qu'il existe et est validé
    let laboratoire = null;

    if (laboratoireId !== undefined && laboratoireId !== null) {
      laboratoire = await prisma.laboratoire.findUnique({
        where: {
          id: Number(laboratoireId)
        }
      });

      if (!laboratoire) {
        return res.status(404).json({
          message: "Laboratoire introuvable"
        });
      }

      if (laboratoire.statut !== "VALIDE") {
        return res.status(400).json({
          message: "Ce laboratoire n'est pas encore validé"
        });
      }
    }

    // Hash du mot de passe
    const motDePasseHash = await bcrypt.hash(motDePasse, 10);

    // Création du compte
    const utilisateur = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        motDePasse: motDePasseHash,
        laboratoireId: laboratoire ? laboratoire.id : null,
        role: "CHERCHEUR",
        statutCompte: "EN_ATTENTE"
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        statutCompte: true,
        laboratoireId: true,
        dateInscription: true
      }
    });

    return res.status(201).json({
      message: laboratoire
        ? "Inscription réussie. Votre compte est en attente de validation."
        : "Inscription réussie sans laboratoire. Votre compte est en attente de validation.",
      utilisateur
    });

  } catch (error) {
    console.error("Erreur register :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


// ======================================================
// CONNEXION
// ======================================================

const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        message: "Email et mot de passe sont obligatoires"
      });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
      include: {
        laboratoire: {
          select: {
            id: true,
            nom: true,
            description: true,
            statut: true
          }
        },
        laboratoireDirige: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    if (!utilisateur) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect"
      });
    }

    // Vérifier le statut du compte
    if (utilisateur.statutCompte !== "VALIDE") {
      if (utilisateur.statutCompte === "EN_ATTENTE") {
        return res.status(403).json({
          message: "Votre compte est encore en attente de validation"
        });
      }

      if (utilisateur.statutCompte === "BLOQUE") {
        return res.status(403).json({
          message: "Votre compte est bloqué"
        });
      }

      return res.status(403).json({
        message: "Votre compte n'est pas autorisé à se connecter"
      });
    }

    // Vérifier le mot de passe
    const motDePasseCorrect = await bcrypt.compare(
      motDePasse,
      utilisateur.motDePasse
    );

    if (!motDePasseCorrect) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect"
      });
    }

    // Création du JWT
    const token = jwt.sign(
      {
        id: utilisateur.id,
        role: utilisateur.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    return res.status(200).json({
      message: "Connexion réussie",

      token,

      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        grade: utilisateur.grade,
        telephone: utilisateur.telephone,
        role: utilisateur.role,
        statutCompte: utilisateur.statutCompte,

        // null si l'utilisateur n'a pas de laboratoire
        laboratoireId: utilisateur.laboratoireId,

        laboratoire: utilisateur.laboratoire,

        // null si l'utilisateur n'est pas responsable d'un labo
        laboratoireDirige: utilisateur.laboratoireDirige,

        dateInscription: utilisateur.dateInscription
      }
    });

  } catch (error) {
    console.error("Erreur login :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


module.exports = {
    register,
    login
};
