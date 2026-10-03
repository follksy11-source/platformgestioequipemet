const express = require("express");

const {
  envoyerMessage,
  getMessagesRecus,
  getMessagesEnvoyes,
  getMessageById,
  marquerCommeLu,
} = require("../controllers/message.controller");

const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

// Messages reçus
router.get("/recus", getMessagesRecus);

// Messages envoyés
router.get("/envoyes", getMessagesEnvoyes);

// Envoyer un message
router.post("/", envoyerMessage);

// Lire un message
router.get("/:id", getMessageById);

// Marquer comme lu
router.patch("/:id/lu", marquerCommeLu);

module.exports = router;