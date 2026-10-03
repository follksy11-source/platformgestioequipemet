import { useState, useEffect } from "react";
import { commentairesApi } from "../services/api";
import StatutCommentaireBadge from "../components/StatutCommentaireBadge";
import Spinner from "../components/Spinner";

export default function MesCommentaires() {
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    commentairesApi
      .mesCommentaires()
      .then(setCommentaires)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink border-b border-line pb-4">Mes commentaires</h1>

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {commentaires.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 bg-paper p-4">
            <div>
              <p className="text-sm text-ink/80">{c.contenu}</p>
              {c.equipement && <p className="mt-1 text-xs text-ink/50">{c.equipement.nom}</p>}
            </div>
            <StatutCommentaireBadge statut={c.statut} />
          </div>
        ))}
      </div>
    </div>
  );
}