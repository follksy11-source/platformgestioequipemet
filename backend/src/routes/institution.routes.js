const express = require("express");

const router = express.Router();

const {
  getInstitutions,
} = require("../controllers/institution.controller");

// GET /api/institutions
router.get("/", getInstitutions);

module.exports = router;