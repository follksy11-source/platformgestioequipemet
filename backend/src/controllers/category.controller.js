const prisma = require("../lib/prisma");

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.categorie.findMany({
      orderBy: {
        nom: "asc",
      },
      include: {
        _count: {
          select: {
            equipements: true,
          },
        },
      },
    });

    res.json({ categories });
  } catch (error) {
    console.error("Erreur getCategories:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories.",
    });
  }
};

// GET /api/categories/:id
const getCategorieById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID de catégorie invalide.",
      });
    }

    const categorie = await prisma.categorie.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            equipements: true,
          },
        },
      },
    });

    if (!categorie) {
      return res.status(404).json({
        message: "Catégorie introuvable.",
      });
    }

    res.json({ categorie });
  } catch (error) {
    console.error("Erreur getCategorieById:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la catégorie.",
    });
  }
};

// POST /api/categories
const createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        message: "Le nom de la catégorie est obligatoire.",
      });
    }

    const categorie = await prisma.categorie.create({
      data: {
        nom: nom.trim(),
        description: description?.trim() || null,
      },
    });

    res.status(201).json({
      message: "Catégorie créée avec succès.",
      categorie,
    });
  } catch (error) {
    console.error("Erreur createCategorie:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Une catégorie avec ce nom existe déjà.",
      });
    }

    res.status(500).json({
      message: "Erreur lors de la création de la catégorie.",
    });
  }
};

// PUT /api/categories/:id
const updateCategorie = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID de catégorie invalide.",
      });
    }

    const { nom, description } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        message: "Le nom de la catégorie est obligatoire.",
      });
    }

    const categorieExistante = await prisma.categorie.findUnique({
      where: { id },
    });

    if (!categorieExistante) {
      return res.status(404).json({
        message: "Catégorie introuvable.",
      });
    }

    const categorie = await prisma.categorie.update({
      where: { id },
      data: {
        nom: nom.trim(),
        description: description?.trim() || null,
      },
    });

    res.json({
      message: "Catégorie modifiée avec succès.",
      categorie,
    });
  } catch (error) {
    console.error("Erreur updateCategorie:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Une catégorie avec ce nom existe déjà.",
      });
    }

    res.status(500).json({
      message: "Erreur lors de la modification de la catégorie.",
    });
  }
};

// DELETE /api/categories/:id
const deleteCategorie = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID de catégorie invalide.",
      });
    }

    const categorie = await prisma.categorie.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            equipements: true,
          },
        },
      },
    });

    if (!categorie) {
      return res.status(404).json({
        message: "Catégorie introuvable.",
      });
    }

    // On empêche la suppression si des équipements utilisent cette catégorie.
    if (categorie._count.equipements > 0) {
      return res.status(409).json({
        message:
          "Impossible de supprimer cette catégorie car elle est utilisée par des équipements.",
        nombreEquipements: categorie._count.equipements,
      });
    }

    await prisma.categorie.delete({
      where: { id },
    });

    res.json({
      message: "Catégorie supprimée avec succès.",
    });
  } catch (error) {
    console.error("Erreur deleteCategorie:", error);

    res.status(500).json({
      message: "Erreur lors de la suppression de la catégorie.",
    });
  }
};

module.exports = {
  getCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  deleteCategorie,
};