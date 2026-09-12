import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { laboratoiresApi, equipementsApi } from "../services/api";
import Spinner from "../components/Spinner";

function StatCard({ label, value, sub }) {
  return (
    <div className="border border-line bg-paper p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink/50">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [labos, setLabos] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([laboratoiresApi.getAll(), equipementsApi.getAll()])
      .then(([labosData, equipementsData]) => {
        setLabos(labosData);
        setEquipements(equipementsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink/60">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (error) {
    return <p className="mx-auto max-w-3xl px-6 py-16 text-sm text-status-panne">{error}</p>;
  }

  const labosEnAttente = labos.filter((l) => l.statut === "EN_ATTENTE").length;
  const equipementsDisponibles = equipements.filter(
    (e) => e.disponibilite === "INSTALLE_FONCTIONNEL"
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Tableau de bord</h1>
        <p className="mt-1 text-sm text-ink/60">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        <StatCard label="Laboratoires" value={labos.length} />
        <StatCard
          label="Labos en attente"
          value={labosEnAttente}
          sub={labosEnAttente > 0 ? "à valider" : "aucun"}
        />
        <StatCard label="Équipements" value={equipements.length} />
        <StatCard
          label="Disponibles"
          value={equipementsDisponibles}
          sub={`sur ${equipements.length}`}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/admin/laboratoires"
          className="border border-line bg-paper p-5 transition-colors hover:border-primary"
        >
          <h2 className="font-display text-lg text-ink">Laboratoires</h2>
          <p className="mt-1 text-sm text-ink/60">Créer, modifier, valider les laboratoires</p>
        </Link>
        <div className="border border-line bg-paper p-5 opacity-50">
          <h2 className="font-display text-lg text-ink">Équipements</h2>
          <p className="mt-1 text-sm text-ink/60">Gestion à venir</p>
        </div>
        <Link
          to="/admin/demandes"
          className="border border-line bg-paper p-5 transition-colors hover:border-primary"
        >
          <h2 className="font-display text-lg text-ink">Demandes</h2>
          <p className="mt-1 text-sm text-ink/60">Valider ou refuser les demandes en attente</p>
        </Link>
      </div>
    </div>
  );
}
