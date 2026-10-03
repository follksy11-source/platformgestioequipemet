const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware")

const {
  uploadModele3DFact,
  deleteModele3DFact,
} = require("../controllers/uploadFact.controller");

const {
  uploadImageEquipement,
  uploadModele3D: uploadModele3DMiddleware,
  uploadModele3DFact: uploadModele3DFactMiddleware,
} = require("../middleware/upload.middleware");

const {
  uploadPhoto,
  deletePhoto,
  uploadModele3D,
  deleteModele3D,
} = require("../controllers/upload.controller");

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// ======================================================
// PHOTO D'UN ÉQUIPEMENT
// ======================================================

// Upload / remplacement de la photo
router.post(
  "/equipements/:id/photo",
  authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),
  uploadImageEquipement.single("file"),
  uploadPhoto
);

// Suppression de la photo
router.delete(
  "/equipements/:id/photo",
  authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),
  deletePhoto
);

// ======================================================
// MODÈLE 3D D'UN ÉQUIPEMENT
// ======================================================

// Upload / remplacement du modèle 3D
router.post(
  "/equipements/:id/modele-3d",
  authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),
  uploadModele3DMiddleware.single("file"),
  uploadModele3D
);

// Suppression du modèle 3D
router.delete(
  "/equipements/:id/modele-3d",
  authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),
  deleteModele3D
);

router.post(
  "/facts/:id/modele-3d",
  authorize("ADMINISTRATEUR"),
  uploadModele3DFactMiddleware.single("file"),
  uploadModele3DFact
);

router.delete(
  "/facts/:id/modele-3d",
  authorize("ADMINISTRATEUR"),
  deleteModele3DFact
);

module.exports = router;