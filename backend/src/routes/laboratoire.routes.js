const express = require("express");

const {
  getLaboratoires,
  getLaboratoireById,
  createLaboratoire,
  updateLaboratoire,
  deleteLaboratoire,
  validerLaboratoire,
  getMembresLaboratoire,
  getEquipementsLaboratoire,
  getReservationsLaboratoire,
} = require("../controllers/laboratoire.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

// Consultation publique
router.get("/", getLaboratoires);

router.get("/:id/membres", authenticate, getMembresLaboratoire);

router.get("/:id/membres", authenticate, getMembresLaboratoire);

router.get("/:id/equipements", authenticate, getEquipementsLaboratoire);

router.get("/:id", getLaboratoireById);

router.get("/:id", getLaboratoireById);

// Administration
router.post("/", authenticate, authorize("ADMINISTRATEUR"), createLaboratoire);

router.put(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  updateLaboratoire,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  deleteLaboratoire,
);

router.patch(
  "/:id/valider",
  authenticate,
  authorize("ADMINISTRATEUR"),
  validerLaboratoire,
);

router.get("/:id/membres", authenticate, getMembresLaboratoire);

router.get("/:id/equipements", authenticate, getEquipementsLaboratoire);

router.get("/:id/reservations", authenticate, getReservationsLaboratoire);

router.get("/:id", getLaboratoireById);

module.exports = router;
