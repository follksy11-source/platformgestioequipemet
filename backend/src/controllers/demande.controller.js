const prisma = require("../lib/prisma");

/**
 * Créer une demande
 */
const createDemande = async (req, res) => {
  try {
    const utilisateurId = req.user.id;

    const {
      type,
      contenuDemande,
      laboratoireId,
      equipementId,
      nomLaboratoire,
      descriptionLaboratoire,
      institutionId
    } = req.body;

    // Vérifier le type
    const typesAutorises = [
      "AJOUT_LABORATOIRE",
      "REJOINDRE_LABORATOIRE",
      "DEVENIR_RESPONSABLE"
    ];

    if (!typesAutorises.includes(type)) {
      return res.status(400).json({
        message: "Type de demande invalide"
      });
    }

    // Récupérer l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: {
        id: true,
        laboratoireId: true
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    /*
     * =====================================================
     * 1. DEMANDE POUR REJOINDRE UN LABORATOIRE
     * =====================================================
     */
    if (type === "REJOINDRE_LABORATOIRE") {

      // L'utilisateur ne doit pas déjà avoir de laboratoire
      if (utilisateur.laboratoireId) {
        return res.status(400).json({
          message: "Vous appartenez déjà à un laboratoire"
        });
      }

      if (!laboratoireId) {
        return res.status(400).json({
          message: "Le laboratoire est obligatoire"
        });
      }

      // Vérifier le laboratoire
      const laboratoire = await prisma.laboratoire.findUnique({
        where: {
          id: Number(laboratoireId)
        }
      });

      if (!laboratoire) {
        return res.status(404).json({
          message: "Laboratoire introuvable"
        });
      }

      if (laboratoire.statut !== "VALIDE") {
        return res.status(400).json({
          message: "Ce laboratoire n'est pas disponible"
        });
      }

      // Vérifier une demande déjà en attente
      const demandeExistante = await prisma.demande.findFirst({
        where: {
          utilisateurId,
          type: "REJOINDRE_LABORATOIRE",
          statut: "EN_ATTENTE"
        }
      });

      if (demandeExistante) {
        return res.status(400).json({
          message: "Vous avez déjà une demande pour rejoindre un laboratoire"
        });
      }

      const demande = await prisma.demande.create({
        data: {
          type,
          contenuDemande,
          utilisateurId,
          laboratoireId: Number(laboratoireId)
        }
      });

      return res.status(201).json({
        message: "Demande pour rejoindre le laboratoire envoyée",
        demande
      });
    }

    /*
     * =====================================================
     * 2. DEMANDE DE CRÉATION D'UN LABORATOIRE
     * =====================================================
     */
    if (type === "AJOUT_LABORATOIRE") {

      // L'utilisateur ne doit pas déjà avoir de laboratoire
      if (utilisateur.laboratoireId) {
        return res.status(400).json({
          message: "Vous appartenez déjà à un laboratoire"
        });
      }

      if (!nomLaboratoire || !nomLaboratoire.trim()) {
        return res.status(400).json({
          message: "Le nom du laboratoire est obligatoire"
        });
      }

      // Vérifier qu'il n'existe pas déjà une demande en attente
      const demandeExistante = await prisma.demande.findFirst({
        where: {
          utilisateurId,
          type: "AJOUT_LABORATOIRE",
          statut: "EN_ATTENTE"
        }
      });

      if (demandeExistante) {
        return res.status(400).json({
          message: "Vous avez déjà une demande de création de laboratoire en attente"
        });
      }

      // Vérifier le nom du laboratoire
      const laboratoireExiste = await prisma.laboratoire.findFirst({
        where: {
          nom: {
            equals: nomLaboratoire.trim(),
            mode: "insensitive"
          }
        }
      });

      if (laboratoireExiste) {
        return res.status(400).json({
          message: "Un laboratoire portant ce nom existe déjà"
        });
      }

      // Vérifier l'institution si elle est fournie
      if (institutionId) {
        const institution = await prisma.institution.findUnique({
          where: {
            id: Number(institutionId)
          }
        });

        if (!institution) {
          return res.status(404).json({
            message: "Institution introuvable"
          });
        }
      }

      const demande = await prisma.demande.create({
        data: {
          type,
          contenuDemande,
          utilisateurId,

          nomLaboratoire: nomLaboratoire.trim(),
          descriptionLaboratoire:
            descriptionLaboratoire?.trim() || null,

          institutionId: institutionId
            ? Number(institutionId)
            : null
        }
      });

      return res.status(201).json({
        message: "Demande de création de laboratoire envoyée",
        demande
      });
    }

    /*
     * =====================================================
     * 3. DEVENIR RESPONSABLE D'UN ÉQUIPEMENT
     * =====================================================
     */
    if (type === "DEVENIR_RESPONSABLE") {

      // Un utilisateur sans laboratoire ne peut pas
      // devenir responsable d'un équipement
      if (!utilisateur.laboratoireId) {
        return res.status(403).json({
          message:
            "Vous devez appartenir à un laboratoire pour devenir responsable d'un équipement"
        });
      }

      if (!equipementId) {
        return res.status(400).json({
          message: "L'équipement est obligatoire"
        });
      }

      // Vérifier l'équipement
      const equipement = await prisma.equipement.findUnique({
        where: {
          id: Number(equipementId)
        }
      });

      if (!equipement) {
        return res.status(404).json({
          message: "Équipement introuvable"
        });
      }

      // L'équipement doit appartenir au laboratoire
      // de l'utilisateur
      if (equipement.laboratoireId !== utilisateur.laboratoireId) {
        return res.status(403).json({
          message:
            "Vous ne pouvez demander la responsabilité que d'un équipement de votre laboratoire"
        });
      }

      // Vérifier si quelqu'un est déjà responsable
      if (equipement.responsableId) {
        return res.status(400).json({
          message: "Cet équipement possède déjà un responsable"
        });
      }

      // Vérifier une demande déjà existante
      const demandeExistante = await prisma.demande.findFirst({
        where: {
          utilisateurId,
          equipementId: Number(equipementId),
          type: "DEVENIR_RESPONSABLE",
          statut: "EN_ATTENTE"
        }
      });

      if (demandeExistante) {
        return res.status(400).json({
          message:
            "Vous avez déjà une demande en attente pour cet équipement"
        });
      }

      const demande = await prisma.demande.create({
        data: {
          type,
          contenuDemande,
          utilisateurId,
          equipementId: Number(equipementId)
        }
      });

      return res.status(201).json({
        message: "Demande pour devenir responsable envoyée",
        demande
      });
    }

  } catch (error) {
    console.error("Erreur createDemande :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


/**
 * Récupérer les demandes
 */
const getDemandes = async (req, res) => {
  try {
    const utilisateurId = req.user.id;
    const role = req.user.role;

    const where =
      role === "ADMINISTRATEUR"
        ? {}
        : { utilisateurId };

    const demandes = await prisma.demande.findMany({
      where,
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        laboratoire: true,
        equipement: true,
        institution: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json(demandes);

  } catch (error) {
    console.error("Erreur getDemandes :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


/**
 * Récupérer une demande
 */
const getDemandeById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const demande = await prisma.demande.findUnique({
      where: { id },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        laboratoire: true,
        equipement: true,
        institution: true
      }
    });

    if (!demande) {
      return res.status(404).json({
        message: "Demande introuvable"
      });
    }

    // Seul l'admin ou le propriétaire peut voir la demande
    if (
      req.user.role !== "ADMINISTRATEUR" &&
      demande.utilisateurId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Accès interdit"
      });
    }

    return res.json(demande);

  } catch (error) {
    console.error("Erreur getDemandeById :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


/**
 * Valider une demande
 */
const validerDemande = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const demande = await prisma.demande.findUnique({
      where: { id }
    });

    if (!demande) {
      return res.status(404).json({
        message: "Demande introuvable"
      });
    }

    if (demande.statut !== "EN_ATTENTE") {
      return res.status(400).json({
        message: "Cette demande a déjà été traitée"
      });
    }

    /*
     * =====================================================
     * REJOINDRE UN LABORATOIRE
     * =====================================================
     */
    if (demande.type === "REJOINDRE_LABORATOIRE") {

      if (!demande.laboratoireId) {
        return res.status(400).json({
          message: "Aucun laboratoire associé à cette demande"
        });
      }

      const resultat = await prisma.$transaction(async (tx) => {

        const utilisateur = await tx.utilisateur.findUnique({
          where: {
            id: demande.utilisateurId
          }
        });

        if (!utilisateur) {
          throw new Error("Utilisateur introuvable");
        }

        if (utilisateur.laboratoireId) {
          throw new Error(
            "L'utilisateur appartient déjà à un laboratoire"
          );
        }

        const laboratoire = await tx.laboratoire.findUnique({
          where: {
            id: demande.laboratoireId
          }
        });

        if (!laboratoire || laboratoire.statut !== "VALIDE") {
          throw new Error(
            "Le laboratoire n'est plus disponible"
          );
        }

        const utilisateurMisAJour =
          await tx.utilisateur.update({
            where: {
              id: demande.utilisateurId
            },
            data: {
              laboratoireId: laboratoire.id
            }
          });

        const demandeMiseAJour =
          await tx.demande.update({
            where: {
              id: demande.id
            },
            data: {
              statut: "VALIDEE"
            }
          });

        return {
          utilisateurMisAJour,
          demandeMiseAJour
        };
      });

      return res.json({
        message: "Demande validée. L'utilisateur a rejoint le laboratoire.",
        demande: resultat.demandeMiseAJour
      });
    }

    /*
     * =====================================================
     * AJOUTER UN LABORATOIRE
     * =====================================================
     */
    if (demande.type === "AJOUT_LABORATOIRE") {

      if (!demande.nomLaboratoire) {
        return res.status(400).json({
          message: "Nom du laboratoire manquant"
        });
      }

      const resultat = await prisma.$transaction(async (tx) => {

        const utilisateur = await tx.utilisateur.findUnique({
          where: {
            id: demande.utilisateurId
          }
        });

        if (!utilisateur) {
          throw new Error("Utilisateur introuvable");
        }

        if (utilisateur.laboratoireId) {
          throw new Error(
            "L'utilisateur appartient déjà à un laboratoire"
          );
        }

        // Vérifier une nouvelle fois le nom
        const laboratoireExiste =
          await tx.laboratoire.findFirst({
            where: {
              nom: {
                equals: demande.nomLaboratoire,
                mode: "insensitive"
              }
            }
          });

        if (laboratoireExiste) {
          throw new Error(
            "Un laboratoire portant ce nom existe déjà"
          );
        }

        // Création du laboratoire
        const laboratoire =
          await tx.laboratoire.create({
            data: {
              nom: demande.nomLaboratoire,
              description:
                demande.descriptionLaboratoire,
              institutionId:
                demande.institutionId
            }
          });

        // L'utilisateur devient membre ET responsable
        const utilisateurMisAJour =
          await tx.utilisateur.update({
            where: {
              id: utilisateur.id
            },
            data: {
              laboratoireId: laboratoire.id,
              laboratoireDirigeId: laboratoire.id
            }
          });

        const demandeMiseAJour =
          await tx.demande.update({
            where: {
              id: demande.id
            },
            data: {
              statut: "VALIDEE",
              laboratoireId: laboratoire.id
            }
          });

        return {
          laboratoire,
          utilisateurMisAJour,
          demandeMiseAJour
        };
      });

      return res.json({
        message:
          "Demande validée. Le laboratoire a été créé et l'utilisateur en est le responsable.",
        laboratoire: resultat.laboratoire,
        demande: resultat.demandeMiseAJour
      });
    }

    /*
     * =====================================================
     * DEVENIR RESPONSABLE
     * =====================================================
     */
    if (demande.type === "DEVENIR_RESPONSABLE") {

      if (!demande.equipementId) {
        return res.status(400).json({
          message: "Aucun équipement associé à cette demande"
        });
      }

      const resultat = await prisma.$transaction(async (tx) => {

        const utilisateur = await tx.utilisateur.findUnique({
          where: {
            id: demande.utilisateurId
          }
        });

        if (!utilisateur || !utilisateur.laboratoireId) {
          throw new Error(
            "L'utilisateur n'appartient à aucun laboratoire"
          );
        }

        const equipement =
          await tx.equipement.findUnique({
            where: {
              id: demande.equipementId
            }
          });

        if (!equipement) {
          throw new Error("Équipement introuvable");
        }

        if (
          equipement.laboratoireId !==
          utilisateur.laboratoireId
        ) {
          throw new Error(
            "L'équipement n'appartient pas au laboratoire de l'utilisateur"
          );
        }

        if (equipement.responsableId) {
          throw new Error(
            "Cet équipement possède déjà un responsable"
          );
        }

        await tx.equipement.update({
          where: {
            id: equipement.id
          },
          data: {
            responsableId: utilisateur.id
          }
        });

        const demandeMiseAJour =
          await tx.demande.update({
            where: {
              id: demande.id
            },
            data: {
              statut: "VALIDEE"
            }
          });

        return demandeMiseAJour;
      });

      return res.json({
        message:
          "Demande validée. L'utilisateur est maintenant responsable de l'équipement.",
        demande: resultat
      });
    }

  } catch (error) {
    console.error("Erreur validerDemande :", error);

    return res.status(400).json({
      message: error.message || "Impossible de valider la demande"
    });
  }
};


/**
 * Refuser une demande
 */
const refuserDemande = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const demande = await prisma.demande.findUnique({
      where: { id }
    });

    if (!demande) {
      return res.status(404).json({
        message: "Demande introuvable"
      });
    }

    if (demande.statut !== "EN_ATTENTE") {
      return res.status(400).json({
        message: "Cette demande a déjà été traitée"
      });
    }

    const demandeMiseAJour =
      await prisma.demande.update({
        where: { id },
        data: {
          statut: "REFUSEE"
        }
      });

    return res.json({
      message: "Demande refusée",
      demande: demandeMiseAJour
    });

  } catch (error) {
    console.error("Erreur refuserDemande :", error);

    return res.status(500).json({
      message: "Erreur interne du serveur"
    });
  }
};


module.exports = {
  createDemande,
  getDemandes,
  getDemandeById,
  validerDemande,
  refuserDemande
};
