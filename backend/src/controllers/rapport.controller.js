const prisma = require("../lib/prisma");

// ======================================================
// CRÉER UN RAPPORT
// ======================================================
const createRapport = async (req, res) => {
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

    const rapport = await prisma.rapport.create({
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
      message: "Rapport envoyé avec succès.",
      data: rapport,
    });
  } catch (error) {
    console.error("Erreur createRapport :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de la création du rapport.",
    });
  }
};


// ======================================================
// MES RAPPORTS
// ======================================================
const getMesRapports = async (req, res) => {
  try {
    const rapports = await prisma.rapport.findMany({
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
      rapports,
    });
  } catch (error) {
    console.error("Erreur getMesRapports :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// RAPPORTS D'UN ÉQUIPEMENT
// ======================================================
const getRapportsEquipement = async (req, res) => {
  try {
    const equipementId = Number(req.params.equipementId);

    const equipement = await prisma.equipement.findUnique({
      where: {
        id: equipementId,
      },
    });

    if (!equipement) {
      return res.status(404).json({
        message: "Équipement introuvable.",
      });
    }

    const rapports = await prisma.rapport.findMany({
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
      rapports,
    });
  } catch (error) {
    console.error("Erreur getRapportsEquipement :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// TOUS LES RAPPORTS — ADMIN
// ======================================================
const getRapportsAdmin = async (req, res) => {
  try {
    const rapports = await prisma.rapport.findMany({
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
      rapports,
    });
  } catch (error) {
    console.error("Erreur getRapportsAdmin :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// VALIDER UN RAPPORT
// ======================================================
const validerRapport = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const rapport = await prisma.rapport.findUnique({
      where: { id },
    });

    if (!rapport) {
      return res.status(404).json({
        message: "Rapport introuvable.",
      });
    }

    if (rapport.statut !== "EN_ATTENTE") {
      return res.status(400).json({
        message: "Ce rapport a déjà été traité.",
      });
    }

    const resultat = await prisma.rapport.update({
      where: { id },
      data: {
        statut: "VALIDE",
      },
    });

    return res.json({
      message: "Rapport validé.",
      data: resultat,
    });
  } catch (error) {
    console.error("Erreur validerRapport :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// REFUSER UN RAPPORT
// ======================================================
const refuserRapport = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const rapport = await prisma.rapport.findUnique({
      where: { id },
    });

    if (!rapport) {
      return res.status(404).json({
        message: "Rapport introuvable.",
      });
    }

    if (rapport.statut !== "EN_ATTENTE") {
      return res.status(400).json({
        message: "Ce rapport a déjà été traité.",
      });
    }

    const resultat = await prisma.rapport.update({
      where: { id },
      data: {
        statut: "REFUSE",
      },
    });

    return res.json({
      message: "Rapport refusé.",
      data: resultat,
    });
  } catch (error) {
    console.error("Erreur refuserRapport :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


module.exports = {
  createRapport,
  getMesRapports,
  getRapportsEquipement,
  getRapportsAdmin,
  validerRapport,
  refuserRapport,
};