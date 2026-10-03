const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const requireLaboratoire = require("../middleware/requireLaboratoire");
const {
    getEquipements,
    getEquipementById,
    createEquipement,
    updateEquipement,
    deleteEquipement,
    getDisponibilitesEquipement,
    getMesEquipements
} = require("../controllers/equipement.controller");

const router = express.Router();

router.get("/", getEquipements);
router.get(
  "/:id/disponibilites",
  getDisponibilitesEquipement
);
router.get(
  "/mes-equipements",
  authenticate,
  authorize("RESPONSABLE_EQUIPEMENT", "ADMINISTRATEUR"),
  getMesEquipements
);

router.get("/:id", getEquipementById);

router.post("/", authenticate, requireLaboratoire ,authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),createEquipement);

router.put("/:id", authenticate,requireLaboratoire, authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),updateEquipement);

router.delete("/:id", authenticate,requireLaboratoire ,authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),deleteEquipement);

module.exports = router;
