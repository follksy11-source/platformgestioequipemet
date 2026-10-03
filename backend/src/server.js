const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const equipementRoutes = require("./routes/equipement.routes");
const laboratoireRoutes = require("./routes/laboratoire.routes");
const demandeRoutes = require("./routes/demande.routes");
const reservationRoutes = require("./routes/reservation.routes");
const messageRoutes = require("./routes/message.routes");
const commentaireRoutes = require("./routes/commentaire.routes");
const rapportRoutes = require("./routes/rapport.routes");
const travailRechercheRoutes = require("./routes/travailRecherche.routes");
const utilisateurRoutes = require("./routes/utilisateur.routes");
const path = require("path");
const uploadRoutes = require("./routes/upload.routes");
const uploadStructureRoutes = require("./routes/uploadStructure.routes");
const categoryRoutes = require("./routes/category.routes");
const factRoutes = require("./routes/fact.routes");
const institutionRoutes = require("./routes/institution.routes");
const publicationRoutes = require("./routes/publication.routes");

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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Routes équipements
app.use("/api/equipements", equipementRoutes);
// Routes category
app.use("/api/categories", categoryRoutes);
// Route labo
app.use("/api/laboratoires", laboratoireRoutes);
// Route demande
app.use("/api/demandes", demandeRoutes);
// Route authentification
app.use("/api/auth", authRoutes);
// Reservation
app.use("/api/reservations", reservationRoutes);
// Route Message 
app.use("/api/messages", messageRoutes);
// Route commentaire
app.use("/api/commentaires", commentaireRoutes);
// Route Rapport
app.use("/api/rapports", rapportRoutes);
// Routes Traveaux
app.use("/api/travaux-recherche", travailRechercheRoutes);
// Route publication
app.use("/api/publications", publicationRoutes);
// Route gestion users
app.use("/api/utilisateurs", utilisateurRoutes);
// Routes upload
app.use("/api/uploads", uploadRoutes);
// Routes institution
app.use("/api/institutions", institutionRoutes);

// Route facts
app.use("/api/facts", factRoutes);

app.use("/api/uploads", uploadStructureRoutes);


// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
