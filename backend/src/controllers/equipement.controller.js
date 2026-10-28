const prisma = require("../lib/prisma");

const verifierResponsabilite = async (equipementId, user) => {
  // L'administrateur peut tout gérer
  if (user.role === "ADMINISTRATEUR") {
    return true;
  }

  // Récupérer l'équipement
  const equipement = await prisma.equipement.findUnique({
    where: {
      id: equipementId,
    },
  });

  if (!equipement) {
    return null;
  }

  // Le responsable ne peut gérer que son équipement
  return equipement.responsableId === user.id;
};

// GET /api/equipements
const getEquipements = async (req, res) => {
  try {
    const equipements = await prisma.equipement.findMany({
      include: {
        laboratoire: true,
        responsable: true,
        parametres: {
          include: {
            parametre: true,
          },
        },
        matrices: {
          include: {
            matrice: true,
          },
        },
      },
    });

    res.json(equipements);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération des équipements",
    });
  }
};

// GET /api/equipements/:id
const getEquipementById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const equipement = await prisma.equipement.findUnique({
      where: { id },
      include: {
        laboratoire: true,
        responsable: true,
        parametres: {
          include: {
            parametre: true,
          },
        },
        matrices: {
          include: {
            matrice: true,
          },
        },
        travauxRecherche: true,
      },
    });

    if (!equipement) {
      return res.status(404).json({
        message: "Équipement introuvable",
      });
    }

    res.json(equipement);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération de l'équipement",
    });
  }
};

// POST /api/equipements
const createEquipement = async (req, res) => {
  try {
    const {
      nom,
      description,
      caracteristiquesTechniques,
      photo,
      disponibilite,
      laboratoireId,
    } = req.body;

    if (!nom || !disponibilite || !laboratoireId) {
      return res.status(400).json({
        message: "nom, disponibilite et laboratoireId sont obligatoires",
      });
    }
    const utilisateurConnecte = req.user.id;

    const equipement = await prisma.equipement.create({
      data: {
        nom,
        description,
        caracteristiquesTechniques,
        photo,
        disponibilite,
        laboratoireId: Number(laboratoireId),
        responsableId: utilisateurConnecte,
      },
    });

    res.status(201).json(equipement);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la création de l'équipement",
    });
  }
};

// PUT /api/equipements/:id
const updateEquipement = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const autorise = await verifierResponsabilite(id, req.user);

    if (autorise === null) {
      return res.status(404).json({
        message: "Équipement introuvable",
      });
    }

    if (!autorise) {
      return res.status(403).json({
        message: "Vous n'êtes pas responsable de cet équipement",
      });
    }

    const {
      nom,
      description,
      caracteristiquesTechniques,
      photo,
      disponibilite,
      laboratoireId,
    } = req.body;

    const equipement = await prisma.equipement.update({
      where: { id },

      data: {
        nom,
        description,
        caracteristiquesTechniques,
        photo,
        disponibilite,
        laboratoireId: laboratoireId ? Number(laboratoireId) : undefined,
      },
    });

    res.json(equipement);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la modification de l'équipement",
    });
  }
};

// DELETE /api/equipements/:id
const deleteEquipement = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const autorise = await verifierResponsabilite(id, req.user);

    if (autorise === null) {
      return res.status(404).json({
        message: "Équipement introuvable",
      });
    }

    if (!autorise) {
      return res.status(403).json({
        message: "Vous n'êtes pas responsable de cet équipement",
      });
    }

    await prisma.equipement.delete({
      where: { id },
    });

    res.json({
      message: "Équipement supprimé avec succès",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la suppression de l'équipement",
    });
  }
};

const getDisponibilitesEquipement = async (req, res) => {
  try {
    const equipementId = Number(req.params.id);

    if (!Number.isInteger(equipementId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'équipement invalide.",
      });
    }

    const equipement = await prisma.equipement.findUnique({
      where: { id: equipementId },
      select: {
        id: true,
        nom: true,
        disponibilite: true,
      },
    });

    if (!equipement) {
      return res.status(404).json({
        success: false,
        message: "Équipement introuvable.",
      });
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        equipementId,
        statut: "ACCEPTEE",
        dateFin: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        dateDebut: true,
        dateFin: true,
      },
      orderBy: {
        dateDebut: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        equipement,
        reservations,
      },
    });
  } catch (error) {
    console.error("Erreur getDisponibilitesEquipement:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des disponibilités.",
    });
  }
};

const getMesEquipements = async (req, res) => {
  try {
    const equipements = await prisma.equipement.findMany({
      where: {
        responsableId: req.user.id,
      },
      include: {
        laboratoire: {
          select: {
            id: true,
            nom: true,
          },
        },
        categorie: {
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

    return res.status(200).json({
      success: true,
      data: equipements,
    });
  } catch (error) {
    console.error("Erreur getMesEquipements:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de vos équipements.",
    });
  }
};

// GET /api/equipements/:id/reservations
const getReservationsEquipement = async (req, res) => {
  try {
    const equipementId = Number(req.params.id);

    if (!Number.isInteger(equipementId) || equipementId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID d'équipement invalide.",
      });
    }

    // Vérifier l'existence de l'équipement
    const equipement = await prisma.equipement.findUnique({
      where: { id: equipementId },
      select: {
        id: true,
        nom: true,
        responsableId: true,
        laboratoire: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    if (!equipement) {
      return res.status(404).json({
        success: false,
        message: "Équipement introuvable.",
      });
    }

    // Vérifier les autorisations
    const estAdministrateur = req.user.role === "ADMINISTRATEUR";
    const estResponsable = equipement.responsableId === req.user.id;

    if (!estAdministrateur && !estResponsable) {
      return res.status(403).json({
        success: false,
        message:
          "Vous n'êtes pas autorisé à consulter les réservations de cet équipement.",
      });
    }

    // Récupérer toutes les demandes de réservation
    const reservations = await prisma.reservation.findMany({
      where: {
        equipementId,
      },
      select: {
        id: true,
        motif: true,
        statut: true,
        dateDebut: true,
        dateFin: true,
        createdAt: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Initialiser les statistiques
    const statistiques = {
      totalDemandes: reservations.length,
      enAttente: 0,
      acceptees: 0,
      refusees: 0,
      annulees: 0,
      terminees: 0,
    };

    // Calculer le nombre de demandes par statut
    for (const reservation of reservations) {
      switch (reservation.statut) {
        case "EN_ATTENTE":
          statistiques.enAttente++;
          break;

        case "ACCEPTEE":
          statistiques.acceptees++;
          break;

        case "REFUSEE":
          statistiques.refusees++;
          break;

        case "ANNULEE":
          statistiques.annulees++;
          break;

        case "TERMINEE":
          statistiques.terminees++;
          break;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        equipement: {
          id: equipement.id,
          nom: equipement.nom,
          laboratoire: equipement.laboratoire,
        },
        statistiques,
        reservations,
      },
    });
  } catch (error) {
    console.error("Erreur getReservationsEquipement:", error);

    return res.status(500).json({
      success: false,
      message:
        "Erreur lors de la récupération des réservations de cet équipement.",
    });
  }
};

module.exports = {
  getEquipements,
  getEquipementById,
  createEquipement,
  updateEquipement,
  getDisponibilitesEquipement,
  deleteEquipement,
  getMesEquipements,
  getReservationsEquipement,
};
