const express = require("express");

const {
  createDemande,
  getDemandes,
  getDemandeById,
  validerDemande,
  refuserDemande,
} = require("../controllers/demande.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

// Toutes les routes nécessitent une connexion
router.use(authenticate);

// Créer une demande
router.post("/", createDemande);

// Voir les demandes
router.get("/", getDemandes);

// Voir une demande
router.get("/:id", getDemandeById);

// Administration
router.patch(
  "/:id/valider",
  authorize("ADMINISTRATEUR"),
  validerDemande
);

router.patch(
  "/:id/refuser",
  authorize("ADMINISTRATEUR"),
  refuserDemande
);

module.exports = router;
