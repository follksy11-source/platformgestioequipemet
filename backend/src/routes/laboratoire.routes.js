const express = require("express");

const {
  getLaboratoires,
  getLaboratoireById,
  createLaboratoire,
  updateLaboratoire,
  deleteLaboratoire,
  validerLaboratoire,
} = require("../controllers/laboratoire.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

// Consultation publique
router.get("/", getLaboratoires);
router.get("/:id", getLaboratoireById);

// Administration
router.post(
  "/",
  authenticate,
  authorize("ADMINISTRATEUR"),
  createLaboratoire
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  updateLaboratoire
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  deleteLaboratoire
);

router.patch(
  "/:id/valider",
  authenticate,
  authorize("ADMINISTRATEUR"),
  validerLaboratoire
);

module.exports = router;
