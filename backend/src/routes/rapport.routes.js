const express = require("express");

const {
  createRapport,
  getMesRapports,
  getRapportsEquipement,
  getRapportsAdmin,
  validerRapport,
  refuserRapport,
} = require("../controllers/rapport.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware")

const router = express.Router();

// Rapports validés d'un équipement
router.get(
  "/equipement/:equipementId",
  getRapportsEquipement
);

router.use(authenticate);

// Créer un rapport
router.post("/", createRapport);

// Mes rapports
router.get("/mes-rapports", getMesRapports);

// Administration
router.get(
  "/admin",
  authorize("ADMINISTRATEUR"),
  getRapportsAdmin
);

router.patch(
  "/:id/valider",
  authorize("ADMINISTRATEUR"),
  validerRapport
);

router.patch(
  "/:id/refuser",
  authorize("ADMINISTRATEUR"),
  refuserRapport
);

module.exports = router;