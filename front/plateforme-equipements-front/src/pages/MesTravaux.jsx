import { useState, useEffect } from "react";
import { travauxApi } from "../services/api";
import TravailForm from "../components/TravailForm";
import Spinner from "../components/Spinner";

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : null;
}

export default function MesTravaux() {
  const [travaux, setTravaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [actionId, setActionId] = useState(null);

  function refresh() {
    setLoading(true);
    travauxApi
      .mesTravaux()
      .then(setTravaux)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleUpdate(data) {
    await travauxApi.update(editing.id, data);
    setEditing(null);
    refresh();
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer ce travail de recherche ?")) return;
    setActionId(id);
    try {
      await travauxApi.remove(id);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink border-b border-line pb-4">Mes travaux de recherche</h1>
      <p className="mt-2 text-sm text-ink/60">
        Pour ajouter un nouveau travail, rendez-vous sur la fiche de l'équipement concerné.
      </p>

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}
      {!loading && !error && travaux.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Vous n'avez publié aucun travail de recherche.</p>
      )}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {travaux.map((t) =>
          editing?.id === t.id ? (
            <TravailForm
              key={t.id}
              initial={t}
              equipementId={t.equipementId}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={t.id} className="flex items-start justify-between gap-4 bg-paper p-4">
              <div>
                <p className="font-display text-base text-ink">{t.titre}</p>
                <p className="font-mono text-[11px] text-ink/40">
                  {t.equipement?.nom}
                  {t.date && ` · ${formatDate(t.date)}`}
                </p>
                {t.description && <p className="mt-1 text-sm text-ink/70">{t.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button onClick={() => setEditing(t)} className="text-sm font-medium text-ink/60 hover:text-primary">
                  Modifier
                </button>
                <button onClick={() => handleDelete(t.id)} disabled={actionId === t.id}
                  className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50">
                  Supprimer
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}