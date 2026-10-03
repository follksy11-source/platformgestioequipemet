import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EquipmentDetail from "./pages/EquipmentDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLaboratoires from "./pages/admin/AdminLaboratoires";
import NouvelleDemande from "./pages/NouvelleDemande";
import MesDemandes from "./pages/MesDemandes";
import AdminDemandes from "./pages/admin/AdminDemandes";
import Reservation from "./pages/Reservation";
import MesReservations from "./pages/MesReservations";
import GestionReservations from "./pages/GestionReservations";
import ContactResponsable from "./pages/ContactResponsable";
import Messages from "./pages/Messages";
import MesEquipements from "./pages/MesEquipements";
import AdminEquipements from "./pages/admin/AdminEquipements";
import MesCommentaires from "./pages/MesCommentaires";
import AdminCommentaires from "./pages/admin/AdminCommentaires";
import MesRapports from "./pages/MesRapports";
import AdminRapports from "./pages/admin/AdminRapports";
import MesTravaux from "./pages/MesTravaux";
import AdminUtilisateurs from "./pages/admin/AdminUtilisateurs";
import AdminStatistiques from "./pages/admin/AdminStatistiques";
import AdminFacts from "./pages/admin/AdminFacts";
import AdminPublications from "./pages/admin/AdminPublications";
import PublicationDetail from "./pages/PublicationDetail";
export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/equipements/:id" element={<EquipmentDetail />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/laboratoires"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminLaboratoires />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demandes/nouvelle"
          element={
            <ProtectedRoute>
              <NouvelleDemande />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes-demandes"
          element={
            <ProtectedRoute>
              <MesDemandes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/demandes"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminDemandes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservation/:equipementId"
          element={
            <ProtectedRoute>
              <Reservation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes-reservations"
          element={
            <ProtectedRoute>
              <MesReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion-reservations"
          element={
            <ProtectedRoute
              allowedRoles={["ADMINISTRATEUR", "RESPONSABLE_EQUIPEMENT"]}
            >
              <GestionReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact/:equipementId"
          element={
            <ProtectedRoute>
              <ContactResponsable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes-equipements"
          element={
            <ProtectedRoute allowedRoles={["RESPONSABLE_EQUIPEMENT"]}>
              <MesEquipements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/equipements"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminEquipements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes-commentaires"
          element={
            <ProtectedRoute>
              <MesCommentaires />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/commentaires"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminCommentaires />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes-rapports"
          element={
            <ProtectedRoute>
              <MesRapports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rapports"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminRapports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes-travaux"
          element={
            <ProtectedRoute>
              <MesTravaux />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/utilisateurs"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminUtilisateurs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/statistiques"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminStatistiques />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/facts"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminFacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/publications"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}>
              <AdminPublications />
            </ProtectedRoute>
          }
        />
        <Route path="/publications/:id" element={<PublicationDetail />} />
      </Routes>
    </AuthProvider>
  );
}
