const express = require("express");

const {
  createTravail,
  getTravaux,
  getMesTravaux,
  getTravailById,
  getTravauxEquipement,
  updateTravail,
  deleteTravail,
} = require("../controllers/travailRecherche.controller");

const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getTravaux);
router.get("/mes-travaux", authenticate, getMesTravaux);
router.get("/equipement/:equipementId", getTravauxEquipement);
router.get("/:id", getTravailById);

router.use(authenticate);

router.post("/", createTravail);
router.put("/:id", updateTravail);
router.delete("/:id", deleteTravail);

module.exports = router;