import { useState, useEffect } from "react";
import { reservationsApi } from "../services/api";
import StatutReservationBadge from "../components/StatutReservationBadge";
import Spinner from "../components/Spinner";

export default function MesReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  function refresh() {
    setLoading(true);
    reservationsApi
      .mesReservations()
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleAnnuler(id) {
    if (!confirm("Annuler cette réservation ?")) return;
    setActionId(id);
    try {
      await reservationsApi.annuler(id);
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Mes réservations</h1>
        <p className="mt-1 font-mono text-xs text-ink/50">{reservations.length} réservation(s)</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}
      {!loading && !error && reservations.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Vous n'avez aucune réservation pour l'instant.</p>
      )}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {reservations.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 bg-paper p-4">
            <div>
              <p className="font-display text-base text-ink">{r.equipement?.nom}</p>
              <p className="text-sm text-ink/60">
                {formatDate(r.dateDebut)} → {formatDate(r.dateFin)}
              </p>
              {r.motif && <p className="mt-1 text-xs text-ink/50">{r.motif}</p>}
            </div>
            <div className="flex items-center gap-3">
              <StatutReservationBadge statut={r.statut} />
              {r.statut === "EN_ATTENTE" && (
                <button
                  onClick={() => handleAnnuler(r.id)}
                  disabled={actionId === r.id}
                  className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}