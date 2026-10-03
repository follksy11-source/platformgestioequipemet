const prisma = require("../lib/prisma");

// ======================================================
// AJOUTER UN COMMENTAIRE
// ======================================================
const createCommentaire = async (req, res) => {
  try {
    const { contenu, equipementId } = req.body;

    if (!contenu?.trim() || !equipementId) {
      return res.status(400).json({
        message: "Le contenu et l'équipement sont obligatoires.",
      });
    }

    const equipement = await prisma.equipement.findUnique({
      where: {
        id: Number(equipementId),
      },
    });

    if (!equipement) {
      return res.status(404).json({
        message: "Équipement introuvable.",
      });
    }

    const commentaire = await prisma.commentaire.create({
      data: {
        contenu: contenu.trim(),
        auteurId: req.user.id,
        equipementId: Number(equipementId),
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        equipement: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Commentaire ajouté. Il est en attente de validation.",
      data: commentaire,
    });
  } catch (error) {
    console.error("Erreur createCommentaire :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de la création du commentaire.",
    });
  }
};


// ======================================================
// COMMENTAIRES VALIDÉS D'UN ÉQUIPEMENT
// ======================================================
const getCommentairesEquipement = async (req, res) => {
  try {
    const equipementId = Number(req.params.equipementId);

    const commentaires = await prisma.commentaire.findMany({
      where: {
        equipementId,
        statut: "VALIDE",
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.json({
      commentaires,
    });
  } catch (error) {
    console.error("Erreur getCommentairesEquipement :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// MES COMMENTAIRES
// ======================================================
const getMesCommentaires = async (req, res) => {
  try {
    const commentaires = await prisma.commentaire.findMany({
      where: {
        auteurId: req.user.id,
      },
      include: {
        equipement: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.json({
      commentaires,
    });
  } catch (error) {
    console.error("Erreur getMesCommentaires :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// TOUS LES COMMENTAIRES — ADMIN
// ======================================================
const getCommentairesAdmin = async (req, res) => {
  try {
    const commentaires = await prisma.commentaire.findMany({
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        equipement: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.json({
      commentaires,
    });
  } catch (error) {
    console.error("Erreur getCommentairesAdmin :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// VALIDER UN COMMENTAIRE
// ======================================================
const validerCommentaire = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const commentaire = await prisma.commentaire.findUnique({
      where: { id },
    });

    if (!commentaire) {
      return res.status(404).json({
        message: "Commentaire introuvable.",
      });
    }

    if (commentaire.statut !== "EN_ATTENTE") {
      return res.status(400).json({
        message: "Ce commentaire a déjà été traité.",
      });
    }

    const resultat = await prisma.commentaire.update({
      where: { id },
      data: {
        statut: "VALIDE",
      },
    });

    return res.json({
      message: "Commentaire validé.",
      data: resultat,
    });
  } catch (error) {
    console.error("Erreur validerCommentaire :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// REFUSER UN COMMENTAIRE
// ======================================================
const refuserCommentaire = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const commentaire = await prisma.commentaire.findUnique({
      where: { id },
    });

    if (!commentaire) {
      return res.status(404).json({
        message: "Commentaire introuvable.",
      });
    }

    if (commentaire.statut !== "EN_ATTENTE") {
      return res.status(400).json({
        message: "Ce commentaire a déjà été traité.",
      });
    }

    const resultat = await prisma.commentaire.update({
      where: { id },
      data: {
        statut: "REFUSE",
      },
    });

    return res.json({
      message: "Commentaire refusé.",
      data: resultat,
    });
  } catch (error) {
    console.error("Erreur refuserCommentaire :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


module.exports = {
  createCommentaire,
  getCommentairesEquipement,
  getMesCommentaires,
  getCommentairesAdmin,
  validerCommentaire,
  refuserCommentaire,
};