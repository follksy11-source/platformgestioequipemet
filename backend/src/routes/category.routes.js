const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware")

const {
  getCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  deleteCategorie,
} = require("../controllers/category.controller");

// Consultation publique
router.get("/", getCategories);
router.get("/:id", getCategorieById);

// Gestion réservée à l'administrateur
router.post(
  "/",
  authenticate,
  authorize("ADMINISTRATEUR"),
  createCategorie
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  updateCategorie
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  deleteCategorie
);

module.exports = router;