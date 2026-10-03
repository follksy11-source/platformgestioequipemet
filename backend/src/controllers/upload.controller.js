const path = require("path");
const fs = require("fs");
const prisma = require("../lib/prisma");

// Vérifie que l'utilisateur peut modifier cet équipement
async function verifierAutorisationEquipement(req, equipementId) {
  const equipement = await prisma.equipement.findUnique({
    where: { id: equipementId },
  });

  if (!equipement) {
    return {
      autorise: false,
      status: 404,
      message: "Équipement introuvable.",
    };
  }

  // Administrateur : accès total
  if (req.user.role === "ADMINISTRATEUR") {
    return { autorise: true, equipement };
  }

  // Responsable de l'équipement
  if (
    req.user.role === "RESPONSABLE_EQUIPEMENT" &&
    equipement.responsableId === req.user.id
  ) {
    return { autorise: true, equipement };
  }

  return {
    autorise: false,
    status: 403,
    message: "Vous n'êtes pas autorisé à modifier cet équipement.",
  };
}

// Upload de la photo
const uploadPhoto = async (req, res) => {
  try {
    const equipementId = Number(req.params.id);

    if (!Number.isInteger(equipementId)) {
      return res.status(400).json({
        message: "ID d'équipement invalide.",
      });
    }

    const verification = await verifierAutorisationEquipement(
      req,
      equipementId
    );

    if (!verification.autorise) {
      return res.status(verification.status).json({
        message: verification.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Aucune image envoyée.",
      });
    }

    // Supprimer l'ancienne photo si elle existe
    if (verification.equipement.photo) {
      const anciennePhoto = path.join(
        __dirname,
        "../../",
        verification.equipement.photo
      );

      if (fs.existsSync(anciennePhoto)) {
        fs.unlinkSync(anciennePhoto);
      }
    }

    const photoUrl = `/uploads/images/equipements/${req.file.filename}`;

    const equipement = await prisma.equipement.update({
      where: { id: equipementId },
      data: {
        photo: photoUrl,
      },
    });

    return res.status(200).json({
      message: "Photo de l'équipement enregistrée avec succès.",
      data: equipement,
    });
  } catch (error) {
    console.error("Erreur upload photo :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de l'upload de la photo.",
    });
  }
};

// Supprimer la photo
const deletePhoto = async (req, res) => {
  try {
    const equipementId = Number(req.params.id);

    const verification = await verifierAutorisationEquipement(
      req,
      equipementId
    );

    if (!verification.autorise) {
      return res.status(verification.status).json({
        message: verification.message,
      });
    }

    if (!verification.equipement.photo) {
      return res.status(404).json({
        message: "Cet équipement n'a pas de photo.",
      });
    }

    const photoPath = path.join(
      __dirname,
      "../../",
      verification.equipement.photo
    );

    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    const equipement = await prisma.equipement.update({
      where: { id: equipementId },
      data: {
        photo: null,
      },
    });

    return res.status(200).json({
      message: "Photo supprimée avec succès.",
      data: equipement,
    });
  } catch (error) {
    console.error("Erreur suppression photo :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de la suppression de la photo.",
    });
  }
};

// Upload du modèle 3D
const uploadModele3D = async (req, res) => {
  try {
    const equipementId = Number(req.params.id);

    if (!Number.isInteger(equipementId)) {
      return res.status(400).json({
        message: "ID d'équipement invalide.",
      });
    }

    const verification = await verifierAutorisationEquipement(
      req,
      equipementId
    );

    if (!verification.autorise) {
      return res.status(verification.status).json({
        message: verification.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Aucun modèle 3D envoyé.",
      });
    }

    // Supprimer l'ancien modèle
    if (verification.equipement.modele3D) {
      const ancienModele = path.join(
        __dirname,
        "../../",
        verification.equipement.modele3D
      );

      if (fs.existsSync(ancienModele)) {
        fs.unlinkSync(ancienModele);
      }
    }

   const modele3DUrl = `/uploads/models/equipements/${req.file.filename}`;

    const equipement = await prisma.equipement.update({
      where: { id: equipementId },
      data: {
        modele3D: modele3DUrl,
      },
    });

    return res.status(200).json({
      message: "Modèle 3D enregistré avec succès.",
      data: equipement,
    });
  } catch (error) {
    console.error("Erreur upload modèle 3D :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de l'upload du modèle 3D.",
    });
  }
};

// Supprimer le modèle 3D
const deleteModele3D = async (req, res) => {
  try {
    const equipementId = Number(req.params.id);

    const verification = await verifierAutorisationEquipement(
      req,
      equipementId
    );

    if (!verification.autorise) {
      return res.status(verification.status).json({
        message: verification.message,
      });
    }

    if (!verification.equipement.modele3D) {
      return res.status(404).json({
        message: "Cet équipement n'a pas de modèle 3D.",
      });
    }

    const modelePath = path.join(
      __dirname,
      "../../",
      verification.equipement.modele3D
    );

    if (fs.existsSync(modelePath)) {
      fs.unlinkSync(modelePath);
    }

    const equipement = await prisma.equipement.update({
      where: { id: equipementId },
      data: {
        modele3D: null,
      },
    });

    return res.status(200).json({
      message: "Modèle 3D supprimé avec succès.",
      data: equipement,
    });
  } catch (error) {
    console.error("Erreur suppression modèle 3D :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de la suppression du modèle 3D.",
    });
  }
};

module.exports = {
  uploadPhoto,
  deletePhoto,
  uploadModele3D,
  deleteModele3D,
};