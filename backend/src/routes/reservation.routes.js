const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const requireLaboratoire = require("../middleware/requireLaboratoire");

const {
  createReservation,
  getMesReservations,
  getReservationById,
  getReservationsGestion,
  accepterReservation,
  refuserReservation,
  annulerReservation
} = require("../controllers/reservation.controller");

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// L'utilisateur doit appartenir à un laboratoire
router.post(
  "/",
  requireLaboratoire,
  createReservation
);

// Voir ses propres réservations
router.get(
  "/mes-reservations",
  requireLaboratoire,
  getMesReservations
);

router.get(
  "/gestion",
  getReservationsGestion
);

// Voir une réservation
router.get(
  "/:id",
  requireLaboratoire,
  getReservationById
);

router.patch("/:id/accepter", accepterReservation);

router.patch("/:id/refuser", refuserReservation);

router.patch("/:id/annuler", annulerReservation);

module.exports = router;