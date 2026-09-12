const prisma = require("../lib/prisma");

const requireLaboratoire = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentification requise"
      });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        laboratoireId: true
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    if (!utilisateur.laboratoireId) {
      return res.status(403).json({
        message: "Vous devez appartenir à un laboratoire pour effectuer cette action"
      });
    }

    // On conserve l'information pour les contrôleurs
    req.laboratoireId = utilisateur.laboratoireId;

    next();

  } catch (error) {
    console.error("Erreur requireLaboratoire :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};

module.exports = requireLaboratoire;
