const prisma = require("../lib/prisma");

const verifierResponsabilite = async (equipementId, user) => {
    // L'administrateur peut tout gérer
    if (user.role === "ADMINISTRATEUR") {
        return true;
    }

    // Récupérer l'équipement
    const equipement = await prisma.equipement.findUnique({
        where: {
            id: equipementId
        }
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
                        parametre: true
                    }
                },
                matrices: {
                    include: {
                        matrice: true
                    }
                }
            }
        });

        res.json(equipements);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la récupération des équipements"
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
                        parametre: true
                    }
                },
                matrices: {
                    include: {
                        matrice: true
                    }
                },
                travauxRecherche: true
            }
        });

        if (!equipement) {
            return res.status(404).json({
                message: "Équipement introuvable"
            });
        }

        res.json(equipement);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la récupération de l'équipement"
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
            laboratoireId
        } = req.body;

        if (!nom || !disponibilite || !laboratoireId) {
            return res.status(400).json({
                message: "nom, disponibilite et laboratoireId sont obligatoires"
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
                responsableId: utilisateurConnecte
            }
        });

        res.status(201).json(equipement);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la création de l'équipement"
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
                message: "Équipement introuvable"
            });
        }

        if (!autorise) {
            return res.status(403).json({
                message: "Vous n'êtes pas responsable de cet équipement"
            });
        }

        const {
            nom,
            description,
            caracteristiquesTechniques,
            photo,
            disponibilite,
            laboratoireId
        } = req.body;

        const equipement = await prisma.equipement.update({
            where: { id },

            data: {
                nom,
                description,
                caracteristiquesTechniques,
                photo,
                disponibilite,
                laboratoireId: laboratoireId
                    ? Number(laboratoireId)
                    : undefined
            }
        });

        res.json(equipement);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la modification de l'équipement"
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
                message: "Équipement introuvable"
            });
        }

        if (!autorise) {
            return res.status(403).json({
                message: "Vous n'êtes pas responsable de cet équipement"
            });
        }

        await prisma.equipement.delete({
            where: { id }
        });

        res.json({
            message: "Équipement supprimé avec succès"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la suppression de l'équipement"
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

module.exports = {
    getEquipements,
    getEquipementById,
    createEquipement,
    updateEquipement,
    getDisponibilitesEquipement,
    deleteEquipement,
    getMesEquipements,
};
