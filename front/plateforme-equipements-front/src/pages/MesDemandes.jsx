import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { demandesApi } from "../services/api";
import DemandeCard from "../components/DemandeCard";
import Spinner from "../components/Spinner";

export default function MesDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    demandesApi
      .getAll()
      .then(setDemandes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Mes demandes</h1>
          <p className="mt-1 font-mono text-xs text-ink/50">{demandes.length} demande(s)</p>
        </div>
        <Link
          to="/demandes/nouvelle"
          className="bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark"
        >
          + Nouvelle demande
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}
      {!loading && !error && demandes.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Vous n'avez fait aucune demande pour l'instant.</p>
      )}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {demandes.map((d) => (
          <DemandeCard key={d.id} demande={d} />
        ))}
      </div>
    </div>
  );
}
