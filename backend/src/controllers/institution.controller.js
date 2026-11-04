const prisma = require("../lib/prisma");

// GET /api/institutions
const getInstitutions = async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { nom: "asc" },
      include: {
        _count: {
          select: {
            laboratoires: true,
            demandes: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: institutions,
    });
  } catch (error) {
    console.error("Erreur getInstitutions:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des institutions",
    });
  }
};

// GET /api/institutions/:id
const getInstitutionById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide",
      });
    }

    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        laboratoires: {
          orderBy: { nom: "asc" },
        },
        _count: {
          select: {
            laboratoires: true,
            demandes: true,
          },
        },
      },
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution introuvable",
      });
    }

    return res.status(200).json({
      success: true,
      data: institution,
    });
  } catch (error) {
    console.error("Erreur getInstitutionById:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'institution",
    });
  }
};

// POST /api/institutions
const createInstitution = async (req, res) => {
  try {
    const nom = req.body.nom?.trim();
    const adresse = req.body.adresse?.trim() || null;

    if (!nom) {
      return res.status(400).json({
        success: false,
        message: "Le nom de l'institution est obligatoire",
      });
    }

    const institution = await prisma.institution.create({
      data: {
        nom,
        adresse,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Institution créée avec succès",
      data: institution,
    });
  } catch (error) {
    console.error("Erreur createInstitution:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'institution",
    });
  }
};

// PUT /api/institutions/:id
const updateInstitution = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide",
      });
    }

    const data = {};

    if (req.body.nom !== undefined) {
      const nom = req.body.nom.trim();

      if (!nom) {
        return res.status(400).json({
          success: false,
          message: "Le nom ne peut pas être vide",
        });
      }

      data.nom = nom;
    }

    if (req.body.adresse !== undefined) {
      data.adresse = req.body.adresse?.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune donnée à modifier",
      });
    }

    const existing = await prisma.institution.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Institution introuvable",
      });
    }

    const institution = await prisma.institution.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Institution modifiée avec succès",
      data: institution,
    });
  } catch (error) {
    console.error("Erreur updateInstitution:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la modification de l'institution",
    });
  }
};

// DELETE /api/institutions/:id
const deleteInstitution = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide",
      });
    }

    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            laboratoires: true,
            demandes: true,
          },
        },
      },
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution introuvable",
      });
    }

    if (
      institution._count.laboratoires > 0 ||
      institution._count.demandes > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Impossible de supprimer cette institution : elle possède des laboratoires ou des demandes associées.",
        data: institution._count,
      });
    }

    await prisma.institution.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Institution supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteInstitution:", error);

    // Protection supplémentaire en cas de relation créée simultanément.
    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message:
          "Cette institution est encore utilisée et ne peut pas être supprimée.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'institution",
    });
  }
};

module.exports = {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
};
