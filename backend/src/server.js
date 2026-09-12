const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const equipementRoutes = require("./routes/equipement.routes");
const laboratoireRoutes = require("./routes/laboratoire.routes");
const demandeRoutes = require("./routes/demande.routes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
    res.json({
        message: "API Plateforme Équipements AIEA opérationnelle 🚀"
    });
});
// Routes équipements
app.use("/api/equipements", equipementRoutes);
// Route labo
app.use("/api/laboratoires", laboratoireRoutes);
// Route demande
app.use("/api/demandes", demandeRoutes);
// Route authentification
app.use("/api/auth", authRoutes);
// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
