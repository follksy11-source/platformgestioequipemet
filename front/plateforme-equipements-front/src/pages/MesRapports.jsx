import { useState, useEffect } from "react";
import { rapportsApi } from "../services/api";
import StatutRapportBadge from "../components/StatutRapportBadge";
import Spinner from "../components/Spinner";

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

export default function MesRapports() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    rapportsApi
      .mesRapports()
      .then(setRapports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink border-b border-line pb-4">Mes rapports</h1>

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}
      {!loading && !error && rapports.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Vous n'avez soumis aucun rapport.</p>
      )}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {rapports.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-4 bg-paper p-4">
            <div>
              <p className="text-sm text-ink/80">{r.contenu}</p>
              <p className="mt-1 font-mono text-xs text-ink/40">
                {r.equipement?.nom} · {formatDate(r.date)}
              </p>
            </div>
            <StatutRapportBadge statut={r.statut} />
          </div>
        ))}
      </div>
    </div>
  );
}