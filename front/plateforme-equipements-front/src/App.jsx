import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
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

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/equipements/:id" element={<EquipmentDetail />} />
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
        <Route path="/demandes/nouvelle" element={
          <ProtectedRoute><NouvelleDemande /></ProtectedRoute>
        } />
        <Route path="/mes-demandes" element={
          <ProtectedRoute><MesDemandes /></ProtectedRoute>
        } />
        <Route path="/admin/demandes" element={
          <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]}><AdminDemandes /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
