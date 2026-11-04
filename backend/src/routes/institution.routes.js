const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} = require("../controllers/institution.controller");

// Toutes les routes nécessitent une authentification.
router.use(authenticate);

// Lecture : utilisateurs authentifiés.
router.get("/", getInstitutions);
router.get("/:id", getInstitutionById);

// Écriture : administrateur uniquement.
router.post("/", authorize("ADMINISTRATEUR"), createInstitution);

router.put("/:id", authorize("ADMINISTRATEUR"), updateInstitution);

router.delete("/:id", authorize("ADMINISTRATEUR"), deleteInstitution);

module.exports = router;
