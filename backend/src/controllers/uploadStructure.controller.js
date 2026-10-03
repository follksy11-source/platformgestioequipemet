const path = require("path");
const fs = require("fs");
const prisma = require("../lib/prisma");

// ------------------------------------------------------
// Supprimer un ancien fichier
// ------------------------------------------------------

function supprimerFichier(url) {
  if (!url) return;

  const fichier = path.join(__dirname, "../../", url);

  if (fs.existsSync(fichier)) {
    fs.unlinkSync(fichier);
  }
}

// ------------------------------------------------------
// Upload image institution
// ------------------------------------------------------

const uploadImageInstitution = async (req, res) => {
  try {
    const institutionId = Number(req.params.id);

    if (!Number.isInteger(institutionId)) {
      return res.status(400).json({
        message: "ID d'institution invalide.",
      });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      return res.status(404).json({
        message: "Institution introuvable.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Aucune image envoyée.",
      });
    }

    supprimerFichier(institution.image);

    const imageUrl = `/uploads/images/institutions/${req.file.filename}`;

    const updatedInstitution = await prisma.institution.update({
      where: { id: institutionId },
      data: {
        image: imageUrl,
      },
    });

    return res.status(200).json({
      message: "Image de l'institution enregistrée avec succès.",
      data: updatedInstitution,
    });
  } catch (error) {
    console.error("Erreur upload image institution :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de l'upload de l'image.",
    });
  }
};

// ------------------------------------------------------
// Supprimer image institution
// ------------------------------------------------------

const deleteImageInstitution = async (req, res) => {
  try {
    const institutionId = Number(req.params.id);

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      return res.status(404).json({
        message: "Institution introuvable.",
      });
    }

    if (!institution.image) {
      return res.status(404).json({
        message: "Cette institution n'a pas d'image.",
      });
    }

    supprimerFichier(institution.image);

    const updatedInstitution = await prisma.institution.update({
      where: { id: institutionId },
      data: {
        image: null,
      },
    });

    return res.status(200).json({
      message: "Image de l'institution supprimée avec succès.",
      data: updatedInstitution,
    });
  } catch (error) {
    console.error("Erreur suppression image institution :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};

// ------------------------------------------------------
// Upload image laboratoire
// ------------------------------------------------------

const uploadImageLaboratoire = async (req, res) => {
  try {
    const laboratoireId = Number(req.params.id);

    if (!Number.isInteger(laboratoireId)) {
      return res.status(400).json({
        message: "ID de laboratoire invalide.",
      });
    }

    const laboratoire = await prisma.laboratoire.findUnique({
      where: { id: laboratoireId },
    });

    if (!laboratoire) {
      return res.status(404).json({
        message: "Laboratoire introuvable.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Aucune image envoyée.",
      });
    }

    supprimerFichier(laboratoire.image);

    const imageUrl = `/uploads/images/laboratoires/${req.file.filename}`;

    const updatedLaboratoire = await prisma.laboratoire.update({
      where: { id: laboratoireId },
      data: {
        image: imageUrl,
      },
    });

    return res.status(200).json({
      message: "Image du laboratoire enregistrée avec succès.",
      data: updatedLaboratoire,
    });
  } catch (error) {
    console.error("Erreur upload image laboratoire :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de l'upload de l'image.",
    });
  }
};

// ------------------------------------------------------
// Supprimer image laboratoire
// ------------------------------------------------------

const deleteImageLaboratoire = async (req, res) => {
  try {
    const laboratoireId = Number(req.params.id);

    const laboratoire = await prisma.laboratoire.findUnique({
      where: { id: laboratoireId },
    });

    if (!laboratoire) {
      return res.status(404).json({
        message: "Laboratoire introuvable.",
      });
    }

    if (!laboratoire.image) {
      return res.status(404).json({
        message: "Ce laboratoire n'a pas d'image.",
      });
    }

    supprimerFichier(laboratoire.image);

    const updatedLaboratoire = await prisma.laboratoire.update({
      where: { id: laboratoireId },
      data: {
        image: null,
      },
    });

    return res.status(200).json({
      message: "Image du laboratoire supprimée avec succès.",
      data: updatedLaboratoire,
    });
  } catch (error) {
    console.error("Erreur suppression image laboratoire :", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};

module.exports = {
  uploadImageInstitution,
  deleteImageInstitution,
  uploadImageLaboratoire,
  deleteImageLaboratoire,
};