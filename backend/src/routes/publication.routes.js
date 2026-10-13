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
  deletePublicationPdf
} = require("../controllers/publication.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const uploadPublicationFiles = require("../middleware/publicationFilesUpload");

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
  uploadPublicationFiles,
  createPublication
);

// Modifier une publication + éventuellement remplacer l'image
router.put(
  "/:id",
  authenticate,
  authorize("ADMINISTRATEUR"),
  uploadPublicationFiles,
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

router.delete(
  "/:id/pdf",
  authenticate,
  authorize("ADMINISTRATEUR"),
  deletePublicationPdf
);

module.exports = router;