const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware")

const {
  uploadImageLaboratoire: uploadLaboratoireMiddleware,
  uploadImageInstitution: uploadInstitutionMiddleware,
} = require("../middleware/upload.middleware");

const {
  uploadImageInstitution,
  deleteImageInstitution,
  uploadImageLaboratoire,
  deleteImageLaboratoire,
} = require("../controllers/uploadStructure.controller");

router.use(authenticate);

// ======================================================
// INSTITUTIONS
// ======================================================

router.post(
  "/institutions/:id/image",
  authorize("ADMINISTRATEUR"),
  uploadInstitutionMiddleware.single("file"),
  uploadImageInstitution
);

router.delete(
  "/institutions/:id/image",
  authorize("ADMINISTRATEUR"),
  deleteImageInstitution
);

// ======================================================
// LABORATOIRES
// ======================================================

router.post(
  "/laboratoires/:id/image",
  authorize("ADMINISTRATEUR"),
  uploadLaboratoireMiddleware.single("file"),
  uploadImageLaboratoire
);

router.delete(
  "/laboratoires/:id/image",
  authorize("ADMINISTRATEUR"),
  deleteImageLaboratoire
);

module.exports = router;