import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LaboratoireStatusCard() {
  const { user } = useAuth();
  if (!user) return null;

  if (!user.laboratoireId) {
    return (
      <div className="border border-line bg-paper p-6">
        <p className="font-display text-lg text-ink">Vous n'appartenez à aucun laboratoire</p>
        <div className="mt-4 flex gap-3">
          <Link to="/demandes/nouvelle?type=REJOINDRE_LABORATOIRE"
            className="bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark">
            Rejoindre un laboratoire
          </Link>
          <Link to="/demandes/nouvelle?type=AJOUT_LABORATOIRE"
            className="border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-paper">
            Créer un laboratoire
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-line bg-paper p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Mon laboratoire</p>
      <p className="mt-1 font-display text-lg text-ink">{user.laboratoire?.nom}</p>
      <div className="mt-4 flex gap-4 text-sm">
        <Link to="/catalogue" className="text-primary hover:underline">Équipements</Link>
        <Link to="/mes-reservations" className="text-primary hover:underline">Réservations</Link>
        <Link to="/mes-demandes" className="text-primary hover:underline">Mes demandes</Link>
      </div>
    </div>
  );
}
