const prisma = require("../lib/prisma");
const fs = require("fs");
const path = require("path");

const supprimerFichier = (url) => {
  if (!url) return;

  const fichier = path.join(__dirname, "../../", url);

  if (fs.existsSync(fichier)) {
    fs.unlinkSync(fichier);
  }
};

// ======================================================
// UPLOAD MODELE 3D FACT
// ======================================================

const uploadModele3DFact = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID du Fact invalide.",
      });
    }

    const fact = await prisma.fact.findUnique({
      where: { id },
    });

    if (!fact) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        message: "Fact introuvable.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Aucun modèle 3D fourni.",
      });
    }

    // Supprimer l'ancien modèle
    if (fact.modele3D) {
      supprimerFichier(fact.modele3D);
    }

    const modele3D = `/uploads/models/facts/${req.file.filename}`;

    const factMisAJour = await prisma.fact.update({
      where: { id },
      data: {
        modele3D,
      },
      include: {
        categorie: true,
      },
    });

    res.json({
      message: "Modèle 3D du Fact ajouté avec succès.",
      fact: factMisAJour,
    });
  } catch (error) {
    console.error("Erreur uploadModele3DFact:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Erreur lors de l'upload du modèle 3D.",
    });
  }
};

// ======================================================
// DELETE MODELE 3D FACT
// ======================================================

const deleteModele3DFact = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID du Fact invalide.",
      });
    }

    const fact = await prisma.fact.findUnique({
      where: { id },
    });

    if (!fact) {
      return res.status(404).json({
        message: "Fact introuvable.",
      });
    }

    if (fact.modele3D) {
      supprimerFichier(fact.modele3D);
    }

    const factMisAJour = await prisma.fact.update({
      where: { id },
      data: {
        modele3D: "",
      },
    });

    res.json({
      message: "Modèle 3D supprimé avec succès.",
      fact: factMisAJour,
    });
  } catch (error) {
    console.error("Erreur deleteModele3DFact:", error);

    res.status(500).json({
      message: "Erreur lors de la suppression du modèle 3D.",
    });
  }
};

module.exports = {
  uploadModele3DFact,
  deleteModele3DFact,
};