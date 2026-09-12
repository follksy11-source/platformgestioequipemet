import { useState, useEffect } from "react";
import { demandesApi } from "../../services/api";
import DemandeCard from "../../components/DemandeCard";
import Spinner from "../../components/Spinner";

export default function AdminDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("EN_ATTENTE");

  function refresh() {
    setLoading(true);
    demandesApi
      .getAll()
      .then(setDemandes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleValider(id) {
    try {
      await demandesApi.valider(id);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRefuser(id) {
    try {
      await demandesApi.refuser(id);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = filter === "TOUTES" ? demandes : demandes.filter((d) => d.statut === filter);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Demandes</h1>
        <p className="mt-1 font-mono text-xs text-ink/50">{filtered.length} affichée(s)</p>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        {["EN_ATTENTE", "VALIDEE", "REFUSEE", "TOUTES"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-medium ${filter === f ? "text-primary" : "text-ink/50 hover:text-ink"}`}
          >
            {f === "EN_ATTENTE" ? "En attente" : f === "VALIDEE" ? "Validées" : f === "REFUSEE" ? "Refusées" : "Toutes"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Aucune demande dans cette catégorie.</p>
      )}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {filtered.map((d) => (
          <DemandeCard
            key={d.id}
            demande={d}
            showActions
            onValider={handleValider}
            onRefuser={handleRefuser}
          />
        ))}
      </div>
    </div>
  );
}
