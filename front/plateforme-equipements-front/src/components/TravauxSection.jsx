import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { travauxApi } from "../services/api";
import TravailForm from "./TravailForm";
import Spinner from "./Spinner";

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : null;
}

export default function TravauxSection({ equipementId }) {
  const { user } = useAuth();
  const [travaux, setTravaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  function refresh() {
    setLoading(true);
    travauxApi
      .getByEquipement(equipementId)
      .then(setTravaux)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [equipementId]);

  async function handleCreate(data) {
    await travauxApi.create(data);
    setAdding(false);
    refresh();
  }

  return (
    <div className="mt-10 border-t border-line pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">
          Travaux de recherche {travaux.length > 0 && `(${travaux.length})`}
        </h2>
        {user && !adding && (
          <button onClick={() => setAdding(true)} className="text-sm font-medium text-primary hover:underline">
            + Ajouter
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-4">
          <TravailForm equipementId={equipementId} onSubmit={handleCreate} onCancel={() => setAdding(false)} />
        </div>
      )}

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-ink/60">
          <Spinner className="h-4 w-4" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}

      {!loading && travaux.length === 0 && (
        <p className="mt-4 text-sm text-ink/60">Aucun travail de recherche publié pour cet équipement.</p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {travaux.map((t) => (
          <div key={t.id} className="border-b border-line pb-4 last:border-none">
            <p className="font-display text-base text-ink">{t.titre}</p>
            <p className="font-mono text-[11px] text-ink/40">
              {t.auteur?.prenom} {t.auteur?.nom}
              {t.date && ` · ${formatDate(t.date)}`}
            </p>
            {t.description && <p className="mt-1 text-sm text-ink/70">{t.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}