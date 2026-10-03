const prisma = require("../lib/prisma");

// GET /api/institutions
const getInstitutions = async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: {
        nom: "asc",
      },
      include: {
        _count: {
          select: {
            laboratoires: true,
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

module.exports = {
  getInstitutions,
};