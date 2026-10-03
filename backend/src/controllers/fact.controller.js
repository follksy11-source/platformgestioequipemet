const prisma = require("../lib/prisma");

// ======================================================
// GET - Facts publiés
// Public
// ======================================================

const getFacts = async (req, res) => {
  try {
    const facts = await prisma.fact.findMany({
      where: {
        statut: "PUBLIE",
      },
      include: {
        categorie: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ facts });
  } catch (error) {
    console.error("Erreur getFacts:", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des Facts.",
    });
  }
};

// ======================================================
// GET - Fact par ID
// Public
// ======================================================

const getFactById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID du Fact invalide.",
      });
    }

    const fact = await prisma.fact.findFirst({
      where: {
        id,
        statut: "PUBLIE",
      },
      include: {
        categorie: true,
      },
    });

    if (!fact) {
      return res.status(404).json({
        message: "Fact introuvable.",
      });
    }

    res.json({ fact });
  } catch (error) {
    console.error("Erreur getFactById:", error);

    res.status(500).json({
      message: "Erreur lors de la récupération du Fact.",
    });
  }
};

// ======================================================
// GET - Tous les Facts pour l'administration
// Admin
// ======================================================

const getFactsAdmin = async (req, res) => {
  try {
    const facts = await prisma.fact.findMany({
      include: {
        categorie: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ facts });
  } catch (error) {
    console.error("Erreur getFactsAdmin:", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des Facts.",
    });
  }
};

// ======================================================
// POST - Créer un Fact
// Admin
// ======================================================

const createFact = async (req, res) => {
  try {
    const { titre, contenu, modele3D, imageCouverture, categorieId } = req.body;

    if (!titre || !titre.trim()) {
      return res.status(400).json({
        message: "Le titre est obligatoire.",
      });
    }

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({
        message: "Le contenu est obligatoire.",
      });
    }

    if (categorieId !== undefined && categorieId !== null) {
      const categorie = await prisma.categorie.findUnique({
        where: {
          id: Number(categorieId),
        },
      });

      if (!categorie) {
        return res.status(404).json({
          message: "Catégorie introuvable.",
        });
      }
    }

    const fact = await prisma.fact.create({
      data: {
        titre: titre.trim(),
        contenu: contenu.trim(),
        modele3D: modele3D?.trim() || null,
        imageCouverture: imageCouverture?.trim() || null,
        categorieId:
          categorieId !== undefined && categorieId !== null
            ? Number(categorieId)
            : null,
        statut: "BROUILLON",
      },
      include: {
        categorie: true,
      },
    });

    res.status(201).json({
      message: "Fact créé avec succès.",
      fact,
    });
  } catch (error) {
    console.error("Erreur createFact:", error);

    res.status(500).json({
      message: "Erreur lors de la création du Fact.",
    });
  }
};

// ======================================================
// PUT - Modifier un Fact
// Admin
// ======================================================

const updateFact = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { titre, contenu, modele3D, imageCouverture, categorieId } = req.body;

    const fact = await prisma.fact.findUnique({
      where: { id },
    });

    if (!fact) {
      return res.status(404).json({
        message: "Fact introuvable.",
      });
    }

    if (titre !== undefined && !titre.trim()) {
      return res.status(400).json({
        message: "Le titre ne peut pas être vide.",
      });
    }

    if (contenu !== undefined && !contenu.trim()) {
      return res.status(400).json({
        message: "Le contenu ne peut pas être vide.",
      });
    }

    if (categorieId !== undefined && categorieId !== null) {
      const categorie = await prisma.categorie.findUnique({
        where: {
          id: Number(categorieId),
        },
      });

      if (!categorie) {
        return res.status(404).json({
          message: "Catégorie introuvable.",
        });
      }
    }

    const updatedFact = await prisma.fact.update({
      where: { id },
      data: {
        ...(titre !== undefined && {
          titre: titre.trim(),
        }),

        ...(contenu !== undefined && {
          contenu: contenu.trim(),
        }),

        ...(modele3D !== undefined && {
          modele3D: modele3D?.trim() || null,
        }),

        ...(imageCouverture !== undefined && {
          imageCouverture: imageCouverture?.trim() || null,
        }),

        ...(categorieId !== undefined && {
          categorieId:
            categorieId === null || categorieId === ""
              ? null
              : Number(categorieId),
        }),
      },
      include: {
        categorie: true,
      },
    });

    return res.status(200).json({
      message: "Fact modifié avec succès.",
      fact: updatedFact,
    });
  } catch (error) {
    console.error("Erreur updateFact:", error);

    return res.status(500).json({
      message: "Erreur lors de la modification du Fact.",
    });
  }
};

// ======================================================
// PATCH - Publier
// Admin
// ======================================================

const publierFact = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const fact = await prisma.fact.findUnique({
      where: { id },
    });

    if (!fact) {
      return res.status(404).json({
        message: "Fact introuvable.",
      });
    }

    if (!fact.modele3D) {
      return res.status(400).json({
        message: "Impossible de publier : aucun modèle 3D associé.",
      });
    }

    const factPublie = await prisma.fact.update({
      where: { id },
      data: { statut: "PUBLIE" },
    });

    return res.status(200).json({
      message: "Fact publié avec succès.",
      fact: factPublie,
    });
  } catch (error) {
    console.error("Erreur publierFact:", error);

    return res.status(500).json({
      message: "Erreur lors de la publication du fact.",
    });
  }
};

// ======================================================
// PATCH - Archiver
// Admin
// ======================================================

const archiverFact = async (req, res) => {
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

    const factArchive = await prisma.fact.update({
      where: { id },
      data: {
        statut: "ARCHIVE",
      },
    });

    res.json({
      message: "Fact archivé avec succès.",
      fact: factArchive,
    });
  } catch (error) {
    console.error("Erreur archiverFact:", error);

    res.status(500).json({
      message: "Erreur lors de l'archivage du Fact.",
    });
  }
};

// ======================================================
// DELETE - Supprimer
// Admin
// ======================================================

const deleteFact = async (req, res) => {
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

    await prisma.fact.delete({
      where: { id },
    });

    res.json({
      message: "Fact supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur deleteFact:", error);

    res.status(500).json({
      message: "Erreur lors de la suppression du Fact.",
    });
  }
};

const getFactCategories = async (req, res) => {
  try {
    const categories = await prisma.categorie.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Erreur getFactCategories:", error);

    return res.status(500).json({
      message: "Erreur lors de la récupération des catégories de facts.",
    });
  }
};

module.exports = {
  getFacts,
  getFactById,
  getFactsAdmin,
  createFact,
  updateFact,
  publierFact,
  archiverFact,
  deleteFact,
  getFactCategories,
};
