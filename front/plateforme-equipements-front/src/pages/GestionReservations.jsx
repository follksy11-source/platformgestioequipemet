import { useState, useEffect } from "react";
import { reservationsApi } from "../services/api";
import StatutReservationBadge from "../components/StatutReservationBadge";
import Spinner from "../components/Spinner";

export default function GestionReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [filter, setFilter] = useState("EN_ATTENTE");

  function refresh() {
    setLoading(true);
    reservationsApi
      .gestion()
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handle(action, id) {
    setActionId(id);
    try {
      await reservationsApi[action](id);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  }

  const filtered =
    filter === "TOUTES" ? reservations : reservations.filter((r) => r.statut === filter);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Gestion des réservations</h1>
        <p className="mt-1 font-mono text-xs text-ink/50">{filtered.length} affichée(s)</p>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        {["EN_ATTENTE", "ACCEPTEE", "REFUSEE", "TOUTES"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-medium ${filter === f ? "text-primary" : "text-ink/50 hover:text-ink"}`}
          >
            {f === "EN_ATTENTE" ? "En attente" : f === "ACCEPTEE" ? "Acceptées" : f === "REFUSEE" ? "Refusées" : "Toutes"}
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
        <p className="mt-6 text-sm text-ink/60">Aucune réservation dans cette catégorie.</p>
      )}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {filtered.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 bg-paper p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-base text-ink">{r.equipement?.nom}</p>
                <p className="text-sm text-ink/60">
                  {formatDate(r.dateDebut)} → {formatDate(r.dateFin)}
                </p>
                {r.utilisateur && (
                  <p className="mt-1 font-mono text-xs text-ink/40">
                    {r.utilisateur.prenom} {r.utilisateur.nom} · {r.utilisateur.email}
                  </p>
                )}
              </div>
              <StatutReservationBadge statut={r.statut} />
            </div>

            {r.motif && <p className="text-sm text-ink/70">{r.motif}</p>}

            {r.statut === "EN_ATTENTE" && (
              <div className="mt-1 flex gap-3 border-t border-line pt-3">
                <button
                  onClick={() => handle("accepter", r.id)}
                  disabled={actionId === r.id}
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handle("refuser", r.id)}
                  disabled={actionId === r.id}
                  className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50"
                >
                  Refuser
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}