const prisma = require("../lib/prisma");

/**
 * Créer une réservation
 */
const createReservation = async (req, res) => {
  try {
    const { equipementId, dateDebut, dateFin, motif } = req.body;

    if (!equipementId || !dateDebut || !dateFin) {
      return res.status(400).json({
        message: "Équipement, date de début et date de fin sont obligatoires"
      });
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        message: "Les dates fournies sont invalides"
      });
    }

    if (debut >= fin) {
      return res.status(400).json({
        message: "La date de début doit être antérieure à la date de fin"
      });
    }

    // Vérifier que l'équipement existe
    const equipement = await prisma.equipement.findUnique({
      where: {
        id: Number(equipementId)
      },
      include: {
        laboratoire: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    if (!equipement) {
      return res.status(404).json({
        message: "Équipement introuvable"
      });
    }

    // L'équipement doit être installé et fonctionnel
    if (equipement.disponibilite !== "INSTALLE_FONCTIONNEL") {
      return res.status(400).json({
        message: "Cet équipement n'est pas actuellement disponible pour une réservation"
      });
    }

    // Vérifier les chevauchements avec les réservations acceptées
    const reservationExistante = await prisma.reservation.findFirst({
      where: {
        equipementId: Number(equipementId),
        statut: "ACCEPTEE",
        dateDebut: {
          lt: fin
        },
        dateFin: {
          gt: debut
        }
      }
    });

    if (reservationExistante) {
      return res.status(409).json({
        message: "L'équipement est déjà réservé pendant cette période"
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        equipementId: Number(equipementId),
        utilisateurId: req.user.id,
        dateDebut: debut,
        dateFin: fin,
        motif: motif || null,
        statut: "EN_ATTENTE"
      },
      include: {
        equipement: {
          select: {
            id: true,
            nom: true,
            laboratoire: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      message: "Demande de réservation créée avec succès",
      reservation
    });

  } catch (error) {
    console.error("Erreur createReservation :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


/**
 * Récupérer les réservations de l'utilisateur connecté
 */
const getMesReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        utilisateurId: req.user.id
      },
      include: {
        equipement: {
          include: {
            laboratoire: true
          }
        }
      },
      orderBy: {
        dateDebut: "desc"
      }
    });

    return res.status(200).json({
      reservations
    });

  } catch (error) {
    console.error("Erreur getMesReservations :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


/**
 * Récupérer une réservation
 */
const getReservationById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            laboratoire: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        },
        equipement: {
          include: {
            laboratoire: true
          }
        }
      }
    });

    if (!reservation) {
      return res.status(404).json({
        message: "Réservation introuvable"
      });
    }

    // Un utilisateur normal ne peut consulter que sa propre réservation
    if (
      req.user.role !== "ADMINISTRATEUR" &&
      reservation.utilisateurId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette réservation"
      });
    }

    return res.status(200).json({
      reservation
    });

  } catch (error) {
    console.error("Erreur getReservationById :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};

/**
 * Accepter une réservation
 * Accessible à l'administrateur ou au responsable de l'équipement
 */
const accepterReservation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        equipement: {
          select: {
            id: true,
            nom: true,
            responsableId: true,
            disponibilite: true
          }
        }
      }
    });

    if (!reservation) {
      return res.status(404).json({
        message: "Réservation introuvable"
      });
    }

    if (reservation.statut !== "EN_ATTENTE") {
      return res.status(400).json({
        message: "Cette réservation n'est plus en attente"
      });
    }

    // Seul l'administrateur ou le responsable de l'équipement peut accepter
    if (
      req.user.role !== "ADMINISTRATEUR" &&
      reservation.equipement.responsableId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à accepter cette réservation"
      });
    }

    if (reservation.equipement.disponibilite !== "INSTALLE_FONCTIONNEL") {
      return res.status(400).json({
        message: "L'équipement n'est plus disponible pour une réservation"
      });
    }

    // Vérifier une nouvelle fois les conflits
    const conflit = await prisma.reservation.findFirst({
      where: {
        equipementId: reservation.equipementId,
        statut: "ACCEPTEE",
        id: {
          not: reservation.id
        },
        dateDebut: {
          lt: reservation.dateFin
        },
        dateFin: {
          gt: reservation.dateDebut
        }
      }
    });

    if (conflit) {
      return res.status(409).json({
        message: "Impossible d'accepter cette réservation : l'équipement est déjà réservé pendant cette période"
      });
    }

    const reservationMiseAJour = await prisma.reservation.update({
      where: { id },
      data: {
        statut: "ACCEPTEE"
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        equipement: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    return res.status(200).json({
      message: "Réservation acceptée avec succès",
      reservation: reservationMiseAJour
    });

  } catch (error) {
    console.error("Erreur accepterReservation :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


/**
 * Refuser une réservation
 * Accessible à l'administrateur ou au responsable de l'équipement
 */
const refuserReservation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        equipement: {
          select: {
            responsableId: true
          }
        }
      }
    });

    if (!reservation) {
      return res.status(404).json({
        message: "Réservation introuvable"
      });
    }

    if (reservation.statut !== "EN_ATTENTE") {
      return res.status(400).json({
        message: "Cette réservation n'est plus en attente"
      });
    }

    if (
      req.user.role !== "ADMINISTRATEUR" &&
      reservation.equipement.responsableId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à refuser cette réservation"
      });
    }

    const reservationMiseAJour = await prisma.reservation.update({
      where: { id },
      data: {
        statut: "REFUSEE"
      }
    });

    return res.status(200).json({
      message: "Réservation refusée",
      reservation: reservationMiseAJour
    });

  } catch (error) {
    console.error("Erreur refuserReservation :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


/**
 * Annuler sa propre réservation
 */
const annulerReservation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const reservation = await prisma.reservation.findUnique({
      where: { id }
    });

    if (!reservation) {
      return res.status(404).json({
        message: "Réservation introuvable"
      });
    }

    // L'utilisateur ne peut annuler que sa propre réservation
    if (reservation.utilisateurId !== req.user.id) {
      return res.status(403).json({
        message: "Vous ne pouvez annuler que vos propres réservations"
      });
    }

    if (
      reservation.statut !== "EN_ATTENTE" &&
      reservation.statut !== "ACCEPTEE"
    ) {
      return res.status(400).json({
        message: "Cette réservation ne peut plus être annulée"
      });
    }

    const reservationMiseAJour = await prisma.reservation.update({
      where: { id },
      data: {
        statut: "ANNULEE"
      }
    });

    return res.status(200).json({
      message: "Réservation annulée avec succès",
      reservation: reservationMiseAJour
    });

  } catch (error) {
    console.error("Erreur annulerReservation :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};

/**
 * Réservations concernant les équipements dont l'utilisateur
 * est responsable.
 *
 * L'administrateur peut voir toutes les réservations.
 */
const getReservationsGestion = async (req, res) => {
  try {
    let where = {};

    if (req.user.role !== "ADMINISTRATEUR") {
      // Un responsable ne voit que les réservations
      // de ses équipements.
      where = {
        equipement: {
          responsableId: req.user.id
        }
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            laboratoire: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        },
        equipement: {
          select: {
            id: true,
            nom: true,
            disponibilite: true,
            laboratoire: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        }
      },
      orderBy: {
        dateDebut: "asc"
      }
    });

    return res.status(200).json({
      reservations
    });

  } catch (error) {
    console.error("Erreur getReservationsGestion :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};

module.exports = {
  createReservation,
  getMesReservations,
  getReservationById,
  getReservationsGestion,
  accepterReservation,
  refuserReservation,
  annulerReservation
};