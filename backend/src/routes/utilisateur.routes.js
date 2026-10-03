const express = require("express");

const {
  getUtilisateurs,
  getUtilisateurById,
  updateUtilisateur,
  validerUtilisateur,
  refuserUtilisateur,
  changerRole,
  deleteUtilisateur,
} = require("../controllers/utilisateur.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware")

const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMINISTRATEUR"));

router.get("/", getUtilisateurs);
router.get("/:id", getUtilisateurById);

router.put("/:id", updateUtilisateur);

router.patch("/:id/valider", validerUtilisateur);
router.patch("/:id/refuser", refuserUtilisateur);
router.patch("/:id/role", changerRole);

router.delete("/:id", deleteUtilisateur);

module.exports = router;