const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const requireLaboratoire = require("../middleware/requireLaboratoire");
const {
    getEquipements,
    getEquipementById,
    createEquipement,
    updateEquipement,
    deleteEquipement
} = require("../controllers/equipement.controller");

const router = express.Router();

router.get("/", getEquipements);

router.get("/:id", getEquipementById);

router.post("/", authenticate, requireLaboratoire ,authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),createEquipement);

router.put("/:id",requireLaboratoire, authenticate ,authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),updateEquipement);

router.delete("/:id", authenticate,requireLaboratoire ,authorize("ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"),deleteEquipement);

module.exports = router;
