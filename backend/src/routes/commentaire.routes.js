const express = require("express");

const {
  createCommentaire,
  getCommentairesEquipement,
  getMesCommentaires,
  getCommentairesAdmin,
  validerCommentaire,
  refuserCommentaire,
} = require("../controllers/commentaire.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware")

const router = express.Router();

// Commentaires publics validés
router.get("/equipement/:equipementId", getCommentairesEquipement);

// Tout le reste nécessite une authentification
router.use(authenticate);

// Ajouter un commentaire
router.post("/", createCommentaire);

// Mes commentaires
router.get("/mes-commentaires", getMesCommentaires);

// Administration
router.get(
  "/admin",
  authorize("ADMINISTRATEUR"),
  getCommentairesAdmin
);

router.patch(
  "/:id/valider",
  authorize("ADMINISTRATEUR"),
  validerCommentaire
);

router.patch(
  "/:id/refuser",
  authorize("ADMINISTRATEUR"),
  refuserCommentaire
);

module.exports = router;