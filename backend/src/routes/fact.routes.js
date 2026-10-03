const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  getFacts,
  getFactById,
  getFactsAdmin,
  createFact,
  updateFact,
  publierFact,
  archiverFact,
  deleteFact,
  getFactCategories,
} = require("../controllers/fact.controller");

router.get("/categories", getFactCategories);

// ADMIN
router.get(
  "/admin/all",
  authenticate,
  authorize("ADMINISTRATEUR"),
  getFactsAdmin,
);

router.post("/", authenticate, authorize("ADMINISTRATEUR"), createFact);

router.put("/:id", authenticate, authorize("ADMINISTRATEUR"), updateFact);

router.patch(
  "/:id/publier",
  authenticate,
  authorize("ADMINISTRATEUR"),
  publierFact,
);

router.patch(
  "/:id/archiver",
  authenticate,
  authorize("ADMINISTRATEUR"),
  archiverFact,
);

router.delete("/:id", authenticate, authorize("ADMINISTRATEUR"), deleteFact);

// PUBLIC
router.get("/", getFacts);
router.get("/:id", getFactById);

module.exports = router;
