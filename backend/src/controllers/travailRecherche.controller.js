const prisma = require("../lib/prisma");

// Créer un travail de recherche
const createTravail = async (req, res) => {
  try {
    const { titre, description, date, equipementId } = req.body;

    if (!titre || !equipementId) {
      return res.status(400).json({
        message: "Le titre et l'équipement sont obligatoires.",
      });
    }

    const equipement = await prisma.equipement.findUnique({
      where: { id: Number(equipementId) },
    });

    if (!equipement) {
      return res.status(404).json({
        message: "Équipement introuvable.",
      });
    }

    const travail = await prisma.travailRecherche.create({
      data: {
        titre,
        description: description || null,
        date: date ? new Date(date) : null,
        equipementId: Number(equipementId),
        auteurId: req.user.id,
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

    res.status(201).json({
      message: "Travail de recherche créé avec succès.",
      data: travail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création du travail de recherche.",
    });
  }
};

// Tous les travaux
const getTravaux = async (req, res) => {
  try {
    const travaux = await prisma.travailRecherche.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ travaux });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des travaux.",
    });
  }
};

// Mes travaux
const getMesTravaux = async (req, res) => {
  try {
    const travaux = await prisma.travailRecherche.findMany({
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
        createdAt: "desc",
      },
    });

    res.json({ travaux });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de vos travaux.",
    });
  }
};

// Un travail précis
const getTravailById = async (req, res) => {
  try {
    const travail = await prisma.travailRecherche.findUnique({
      where: {
        id: Number(req.params.id),
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

    if (!travail) {
      return res.status(404).json({
        message: "Travail de recherche introuvable.",
      });
    }

    res.json({ travail });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération du travail.",
    });
  }
};

// Travaux liés à un équipement
const getTravauxEquipement = async (req, res) => {
  try {
    const equipementId = Number(req.params.equipementId);

    const equipement = await prisma.equipement.findUnique({
      where: { id: equipementId },
    });

    if (!equipement) {
      return res.status(404).json({
        message: "Équipement introuvable.",
      });
    }

    const travaux = await prisma.travailRecherche.findMany({
      where: { equipementId },
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

    res.json({ travaux });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des travaux.",
    });
  }
};

// Modifier
const updateTravail = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titre, description, date, equipementId } = req.body;

    const travail = await prisma.travailRecherche.findUnique({
      where: { id },
    });

    if (!travail) {
      return res.status(404).json({
        message: "Travail de recherche introuvable.",
      });
    }

    // Seul l'auteur ou un administrateur peut modifier
    if (
      travail.auteurId !== req.user.id &&
      req.user.role !== "ADMINISTRATEUR"
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier ce travail.",
      });
    }

    if (equipementId !== undefined) {
      const equipement = await prisma.equipement.findUnique({
        where: { id: Number(equipementId) },
      });

      if (!equipement) {
        return res.status(404).json({
          message: "Équipement introuvable.",
        });
      }
    }

    const updated = await prisma.travailRecherche.update({
      where: { id },
      data: {
        ...(titre !== undefined && { titre }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && {
          date: date ? new Date(date) : null,
        }),
        ...(equipementId !== undefined && {
          equipementId: Number(equipementId),
        }),
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

    res.json({
      message: "Travail de recherche modifié avec succès.",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification du travail.",
    });
  }
};

// Supprimer
const deleteTravail = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const travail = await prisma.travailRecherche.findUnique({
      where: { id },
    });

    if (!travail) {
      return res.status(404).json({
        message: "Travail de recherche introuvable.",
      });
    }

    if (
      travail.auteurId !== req.user.id &&
      req.user.role !== "ADMINISTRATEUR"
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce travail.",
      });
    }

    await prisma.travailRecherche.delete({
      where: { id },
    });

    res.json({
      message: "Travail de recherche supprimé avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression du travail.",
    });
  }
};

module.exports = {
  createTravail,
  getTravaux,
  getMesTravaux,
  getTravailById,
  getTravauxEquipement,
  updateTravail,
  deleteTravail,
};