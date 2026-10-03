const prisma = require("../lib/prisma");

// Créer une publication

const createPublication = async (req, res) => {
  try {
    const { type, titre, contenu, statut } = req.body;

    // L'utilisateur connecté doit être fourni par le middleware JWT
    const auteurId = req.user.id;

    if (!auteurId) {
      return res.status(401).json({
        message: "Utilisateur non authentifié.",
      });
    }

    if (!type || !titre || !contenu) {
      return res.status(400).json({
        message: "Le type, le titre et le contenu sont obligatoires.",
      });
    }

    // Si une image a été envoyée
    const image = req.file
      ? `/uploads/images/publications/${req.file.filename}`
      : null;

    const publication = await prisma.publication.create({
      data: {
        type,
        titre,
        contenu,
        statut: statut || "BROUILLON",
        auteurId,
        image,
      },
    });

    return res.status(201).json({
      message: "Publication créée avec succès.",
      publication,
    });
  } catch (error) {
    console.error("Erreur createPublication :", error);

    return res.status(500).json({
      message: "Erreur lors de la création de la publication.",
      error: error.message,
    });
  }
};

// Publications publiées
const getPublications = async (req, res) => {
  try {
    const publications = await prisma.publication.findMany({
      where: {
        statut: "PUBLIEE",
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json({ publications });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération des publications.",
    });
  }
};

// Toutes les publications pour l'administration
const getToutesPublications = async (req, res) => {
  try {
    const publications = await prisma.publication.findMany({
      orderBy: {
        date: "desc",
      },
    });

    res.json({ publications });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération des publications.",
    });
  }
};

// Une publication
const getPublicationById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res
        .status(400)
        .json({ message: "Identifiant de publication invalide." });
    }
    const publication = await prisma.publication.findUnique({
      where: { id: id },
    });
    if (!publication) {
      return res.status(404).json({ message: "Publication introuvable." });
    }
    return res.status(200).json({ publication });
  } catch (error) {
    console.error("Erreur getPublicationById :", error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la publication." });
  }
};
// Modifier
const updatePublication = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type, titre, contenu, statut } = req.body;

    const publication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!publication) {
      return res.status(404).json({
        message: "Publication introuvable.",
      });
    }

    const updated = await prisma.publication.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(titre !== undefined && { titre }),
        ...(contenu !== undefined && { contenu }),
        ...(statut !== undefined && { statut }),
      },
    });

    res.json({
      message: "Publication modifiée avec succès.",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la modification de la publication.",
    });
  }
};

// Publier
const publierPublication = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const publication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!publication) {
      return res.status(404).json({
        message: "Publication introuvable.",
      });
    }

    const updated = await prisma.publication.update({
      where: { id },
      data: {
        statut: "PUBLIEE",
        date: new Date(),
      },
    });

    res.json({
      message: "Publication publiée avec succès.",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la publication.",
    });
  }
};

// Remettre en brouillon
const depublierPublication = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const publication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!publication) {
      return res.status(404).json({
        message: "Publication introuvable.",
      });
    }

    const updated = await prisma.publication.update({
      where: { id },
      data: {
        statut: "BROUILLON",
      },
    });

    res.json({
      message: "Publication remise en brouillon.",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la modification du statut.",
    });
  }
};

// Supprimer
const deletePublication = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const publication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!publication) {
      return res.status(404).json({
        message: "Publication introuvable.",
      });
    }

    await prisma.publication.delete({
      where: { id },
    });

    res.json({
      message: "Publication supprimée avec succès.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la suppression de la publication.",
    });
  }
};

const deletePublicationImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const publication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!publication) {
      return res.status(404).json({ message: "Publication introuvable" });
    }

    // Supprimer le fichier image du disque si nécessaire
    // (avec fs.unlink si vous stockez les images localement)

    await prisma.publication.update({
      where: { id },
      data: { image: null }, // ou le nom de votre champ
    });

    res.json({ message: "Image supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'image" });
  }
};

module.exports = {
  createPublication,
  getPublications,
  getToutesPublications,
  getPublicationById,
  updatePublication,
  publierPublication,
  depublierPublication,
  deletePublication,
  deletePublicationImage,
};
