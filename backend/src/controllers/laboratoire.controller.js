const prisma = require("../lib/prisma");

// =========================================================
// GET /api/laboratoires
// Liste des laboratoires
// =========================================================
const getLaboratoires = async (req, res) => {
  try {
    const laboratoires = await prisma.laboratoire.findMany({
      where: {
        statut: "VALIDE",
      },
      include: {
        institution: true,
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            grade: true,
            telephone: true,
          },
        },
        _count: {
          select: {
            membres: true,
            equipements: true,
          },
        },
      },
      orderBy: {
        nom: "asc",
      },
    });

    res.json(laboratoires);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération des laboratoires",
    });
  }
};

// =========================================================
// GET /api/laboratoires/:id
// Détails d'un laboratoire
// =========================================================
const getLaboratoireById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID du laboratoire invalide",
      });
    }

    const laboratoire = await prisma.laboratoire.findUnique({
      where: {
        id,
      },
      include: {
        institution: true,

        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            grade: true,
            telephone: true,
          },
        },

        membres: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            grade: true,
            role: true,
          },
        },

        equipements: {
          include: {
            responsable: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!laboratoire) {
      return res.status(404).json({
        message: "Laboratoire introuvable",
      });
    }

    res.json(laboratoire);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération du laboratoire",
    });
  }
};

// =========================================================
// POST /api/laboratoires
// Création d'un laboratoire
// =========================================================
const createLaboratoire = async (req, res) => {
  try {
    const {
      nom,
      description,
      institutionId,
    } = req.body;

    if (!nom) {
      return res.status(400).json({
        message: "Le nom du laboratoire est obligatoire",
      });
    }

    // Vérifier si l'institution existe
    if (institutionId !== undefined && institutionId !== null) {
      const institution = await prisma.institution.findUnique({
        where: {
          id: parseInt(institutionId),
        },
      });

      if (!institution) {
        return res.status(404).json({
          message: "Institution introuvable",
        });
      }
    }

    // Vérifier qu'un laboratoire du même nom
    // n'existe pas déjà
    const laboratoireExistant = await prisma.laboratoire.findFirst({
      where: {
        nom,
      },
    });

    if (laboratoireExistant) {
      return res.status(409).json({
        message: "Un laboratoire portant ce nom existe déjà",
      });
    }

    const laboratoire = await prisma.laboratoire.create({
      data: {
        nom,
        description,
        institutionId:
          institutionId !== undefined && institutionId !== null
            ? parseInt(institutionId)
            : null,

        // Création par administrateur :
        // le laboratoire est directement validé
        statut: "VALIDE",
      },

      include: {
        institution: true,
      },
    });

    res.status(201).json({
      message: "Laboratoire créé avec succès",
      laboratoire,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la création du laboratoire",
    });
  }
};

// =========================================================
// PUT /api/laboratoires/:id
// Modification d'un laboratoire
// =========================================================
const updateLaboratoire = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID du laboratoire invalide",
      });
    }

    const {
      nom,
      description,
      institutionId,
    } = req.body;

    const laboratoireExistant = await prisma.laboratoire.findUnique({
      where: {
        id,
      },
    });

    if (!laboratoireExistant) {
      return res.status(404).json({
        message: "Laboratoire introuvable",
      });
    }

    // Vérifier l'institution si elle est fournie
    if (institutionId !== undefined && institutionId !== null) {
      const institution = await prisma.institution.findUnique({
        where: {
          id: parseInt(institutionId),
        },
      });

      if (!institution) {
        return res.status(404).json({
          message: "Institution introuvable",
        });
      }
    }

    // Vérifier le nom seulement s'il est modifié
    if (nom && nom !== laboratoireExistant.nom) {
      const nomExistant = await prisma.laboratoire.findFirst({
        where: {
          nom,
          NOT: {
            id,
          },
        },
      });

      if (nomExistant) {
        return res.status(409).json({
          message: "Un laboratoire portant ce nom existe déjà",
        });
      }
    }

    const laboratoire = await prisma.laboratoire.update({
      where: {
        id,
      },

      data: {
        ...(nom !== undefined && { nom }),
        ...(description !== undefined && { description }),

        ...(institutionId !== undefined && {
          institutionId:
            institutionId === null
              ? null
              : parseInt(institutionId),
        }),
      },

      include: {
        institution: true,
      },
    });

    res.json({
      message: "Laboratoire modifié avec succès",
      laboratoire,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la modification du laboratoire",
    });
  }
};

// =========================================================
// DELETE /api/laboratoires/:id
// Suppression d'un laboratoire
// =========================================================
const deleteLaboratoire = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID du laboratoire invalide",
      });
    }

    const laboratoire = await prisma.laboratoire.findUnique({
      where: {
        id,
      },
      include: {
        membres: true,
        equipements: true,
      },
    });

    if (!laboratoire) {
      return res.status(404).json({
        message: "Laboratoire introuvable",
      });
    }

    // On évite de supprimer un laboratoire
    // qui contient encore des données importantes.
    if (
      laboratoire.membres.length > 0 ||
      laboratoire.equipements.length > 0
    ) {
      return res.status(409).json({
        message:
          "Impossible de supprimer ce laboratoire car il contient encore des membres ou des équipements",
      });
    }

    await prisma.laboratoire.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Laboratoire supprimé avec succès",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la suppression du laboratoire",
    });
  }
};

// =========================================================
// PATCH /api/laboratoires/:id/valider
// Validation d'un laboratoire
// =========================================================
const validerLaboratoire = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID du laboratoire invalide",
      });
    }

    const laboratoire = await prisma.laboratoire.findUnique({
      where: {
        id,
      },
    });

    if (!laboratoire) {
      return res.status(404).json({
        message: "Laboratoire introuvable",
      });
    }

    if (laboratoire.statut === "VALIDE") {
      return res.status(400).json({
        message: "Ce laboratoire est déjà validé",
      });
    }

    const laboratoireValide = await prisma.laboratoire.update({
      where: {
        id,
      },

      data: {
        statut: "VALIDE",
      },
    });

    res.json({
      message: "Laboratoire validé avec succès",
      laboratoire: laboratoireValide,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la validation du laboratoire",
    });
  }
};

module.exports = {
  getLaboratoires,
  getLaboratoireById,
  createLaboratoire,
  updateLaboratoire,
  deleteLaboratoire,
  validerLaboratoire,
};
