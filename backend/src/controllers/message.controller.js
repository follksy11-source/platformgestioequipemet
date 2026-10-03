const prisma = require("../lib/prisma");

// ======================================================
// ENVOYER UN MESSAGE
// ======================================================
const envoyerMessage = async (req, res) => {
  try {
    const { destinataireId, contenu, equipementId } = req.body;

    if (!destinataireId || !contenu?.trim()) {
      return res.status(400).json({
        message: "Le destinataire et le contenu sont obligatoires.",
      });
    }

    if (Number(destinataireId) === req.user.id) {
      return res.status(400).json({
        message: "Vous ne pouvez pas vous envoyer un message à vous-même.",
      });
    }

    // Vérifier le destinataire
    const destinataire = await prisma.utilisateur.findUnique({
      where: {
        id: Number(destinataireId),
      },
    });

    if (!destinataire) {
      return res.status(404).json({
        message: "Destinataire introuvable.",
      });
    }

    // Vérifier l'équipement si fourni
    if (equipementId) {
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
    }

    const message = await prisma.message.create({
      data: {
        contenu: contenu.trim(),
        expediteurId: req.user.id,
        destinataireId: Number(destinataireId),
        equipementId: equipementId ? Number(equipementId) : null,
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        destinataire: {
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
    });

    return res.status(201).json({
      message: "Message envoyé avec succès.",
      data: message,
    });
  } catch (error) {
    console.error("Erreur envoyerMessage :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de l'envoi du message.",
    });
  }
};


// ======================================================
// MES MESSAGES REÇUS
// ======================================================
const getMessagesRecus = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        destinataireId: req.user.id,
      },
      include: {
        expediteur: {
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
      messages,
    });
  } catch (error) {
    console.error("Erreur getMessagesRecus :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// MES MESSAGES ENVOYÉS
// ======================================================
const getMessagesEnvoyes = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        expediteurId: req.user.id,
      },
      include: {
        destinataire: {
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
      messages,
    });
  } catch (error) {
    console.error("Erreur getMessagesEnvoyes :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// LIRE UN MESSAGE
// ======================================================
const getMessageById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const message = await prisma.message.findUnique({
      where: {
        id,
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        destinataire: {
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
    });

    if (!message) {
      return res.status(404).json({
        message: "Message introuvable.",
      });
    }

    // Seuls l'expéditeur ou le destinataire peuvent voir le message
    if (
      message.expediteurId !== req.user.id &&
      message.destinataireId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Accès interdit à ce message.",
      });
    }

    return res.json({
      message,
    });
  } catch (error) {
    console.error("Erreur getMessageById :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


// ======================================================
// MARQUER COMME LU
// ======================================================
const marquerCommeLu = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const message = await prisma.message.findUnique({
      where: {
        id,
      },
    });

    if (!message) {
      return res.status(404).json({
        message: "Message introuvable.",
      });
    }

    if (message.destinataireId !== req.user.id) {
      return res.status(403).json({
        message: "Vous ne pouvez modifier que vos messages reçus.",
      });
    }

    const messageMisAJour = await prisma.message.update({
      where: {
        id,
      },
      data: {
        statut: "LU",
      },
    });

    return res.json({
      message: "Message marqué comme lu.",
      data: messageMisAJour,
    });
  } catch (error) {
    console.error("Erreur marquerCommeLu :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};


module.exports = {
  envoyerMessage,
  getMessagesRecus,
  getMessagesEnvoyes,
  getMessageById,
  marquerCommeLu,
};