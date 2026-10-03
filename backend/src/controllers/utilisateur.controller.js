const prisma = require("../lib/prisma");

// Lister tous les utilisateurs
const getUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        statutCompte: true,
        role: true,
        dateInscription: true,
        laboratoireId: true,
        laboratoire: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: {
        dateInscription: "desc",
      },
    });

    res.json({ utilisateurs });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs.",
    });
  }
};

// Voir un utilisateur
const getUtilisateurById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        statutCompte: true,
        role: true,
        dateInscription: true,
        laboratoireId: true,
        laboratoire: {
          select: {
            id: true,
            nom: true,
            description: true,
          },
        },
      },
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    res.json({ utilisateur });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération de l'utilisateur.",
    });
  }
};

// Modifier un utilisateur
const updateUtilisateur = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      nom,
      prenom,
      email,
      laboratoireId,
    } = req.body;

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    // Vérifier le laboratoire si fourni
    if (laboratoireId !== undefined && laboratoireId !== null) {
      const laboratoire = await prisma.laboratoire.findUnique({
        where: {
          id: Number(laboratoireId),
        },
      });

      if (!laboratoire) {
        return res.status(404).json({
          message: "Laboratoire introuvable.",
        });
      }
    }

    const updated = await prisma.utilisateur.update({
      where: { id },
      data: {
        ...(nom !== undefined && { nom }),
        ...(prenom !== undefined && { prenom }),
        ...(email !== undefined && { email }),
        ...(laboratoireId !== undefined && {
          laboratoireId:
            laboratoireId === null ? null : Number(laboratoireId),
        }),
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        statutCompte: true,
        role: true,
        laboratoireId: true,
        laboratoire: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    res.json({
      message: "Utilisateur modifié avec succès.",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    // Email déjà utilisé
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Cette adresse email est déjà utilisée.",
      });
    }

    res.status(500).json({
      message: "Erreur lors de la modification de l'utilisateur.",
    });
  }
};

// Valider un compte
const validerUtilisateur = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    const updated = await prisma.utilisateur.update({
      where: { id },
      data: {
        statutCompte: "VALIDE",
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        statutCompte: true,
        role: true,
      },
    });

    res.json({
      message: "Compte utilisateur validé avec succès.",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la validation du compte.",
    });
  }
};

// Refuser un compte
const refuserUtilisateur = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    const updated = await prisma.utilisateur.update({
      where: { id },
      data: {
        statutCompte: "REFUSE",
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        statutCompte: true,
        role: true,
      },
    });

    res.json({
      message: "Compte utilisateur refusé.",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors du refus du compte.",
    });
  }
};

// Changer le rôle
const changerRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    const rolesAutorises = [
      "CHERCHEUR",
      "RESPONSABLE_LABORATOIRE",
      "RESPONSABLE_EQUIPEMENT",
      "ADMINISTRATEUR",
    ];

    if (!role || !rolesAutorises.includes(role)) {
      return res.status(400).json({
        message: "Rôle invalide.",
        rolesAutorises,
      });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    const updated = await prisma.utilisateur.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        statutCompte: true,
        laboratoireId: true,
      },
    });

    res.json({
      message: "Rôle modifié avec succès.",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la modification du rôle.",
    });
  }
};

// Supprimer un utilisateur
const deleteUtilisateur = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    // Empêcher l'admin connecté de supprimer son propre compte
    if (id === req.user.id) {
      return res.status(400).json({
        message: "Vous ne pouvez pas supprimer votre propre compte.",
      });
    }

    await prisma.utilisateur.delete({
      where: { id },
    });

    res.json({
      message: "Utilisateur supprimé avec succès.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur.",
    });
  }
};

module.exports = {
  getUtilisateurs,
  getUtilisateurById,
  updateUtilisateur,
  validerUtilisateur,
  refuserUtilisateur,
  changerRole,
  deleteUtilisateur,
};