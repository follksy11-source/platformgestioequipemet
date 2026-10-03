const express = require("express");

const {
  createPublication,
  getPublications,
  getToutesPublications,
  getPublicationById,
  updatePublication,
  publierPublication,
  depublierPublication,
  deletePublication,
  deletePublicationImage,
} = require("../controllers/publication.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const uploadPublicationImage = require("../middleware/publicationUpload");

const router = express.Router();

// ======================================================
// PUBLIC
// ======================================================

router.get("/", getPublications);

// ======================================================
// ADMINISTRATION
// ======================================================

// Toutes les publications, y compris brouillons
router.get(
  "/admin",
  authenticate,
  authorize("ADMINISTRATEUR"),
  getToutesPublications
);
router.get("/:id", getPublicationById);


// Créer une publication + image
router.post(
  "/",
  authenticate,
  authorize("ADMINISTRATEUR"),
  uploadPublicationImage.single("image"),
  createPublication
);

// Modifier une publication + éventuellement remplacer l'image
router.put(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  uploadPublicationImage.single("image"),
  updatePublication
);

// Publier
router.patch(
  "/:id/publier",
  authenticate,
  authorize("ADMINISTRATEUR"),
  publierPublication
);

// Dépublier
router.patch(
  "/:id/depublier",
  authenticate,
  authorize("ADMINISTRATEUR"),
  depublierPublication
);

// Supprimer uniquement l'image
router.delete(
  "/:id/image",
  authenticate,
  authorize("ADMINISTRATEUR"),
  deletePublicationImage
);

// Supprimer la publication
router.delete(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  deletePublication
);

module.exports = router;