import { useState, useEffect } from "react";
import { commentairesApi } from "../../services/api";
import StatutCommentaireBadge from "../../components/StatutCommentaireBadge";
import Spinner from "../../components/Spinner";

export default function AdminCommentaires() {
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [filter, setFilter] = useState("EN_ATTENTE");

  function refresh() {
    setLoading(true);
    commentairesApi
      .admin()
      .then(setCommentaires)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handle(action, id) {
    setActionId(id);
    try {
      await commentairesApi[action](id);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  const filtered = filter === "TOUS" ? commentaires : commentaires.filter((c) => c.statut === filter);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink border-b border-line pb-4">Commentaires</h1>

      <div className="mt-4 flex gap-4 text-sm">
        {["EN_ATTENTE", "VALIDE", "REFUSE", "TOUS"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`font-medium ${filter === f ? "text-primary" : "text-ink/50 hover:text-ink"}`}>
            {f === "EN_ATTENTE" ? "En attente" : f === "VALIDE" ? "Validés" : f === "REFUSE" ? "Refusés" : "Tous"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {filtered.map((c) => (
          <div key={c.id} className="flex flex-col gap-2 bg-paper p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink/80">{c.contenu}</p>
                <p className="mt-1 font-mono text-xs text-ink/40">
                  {c.auteur?.prenom} {c.auteur?.nom} · {c.equipement?.nom}
                </p>
              </div>
              <StatutCommentaireBadge statut={c.statut} />
            </div>
            {c.statut === "EN_ATTENTE" && (
              <div className="flex gap-3 border-t border-line pt-3">
                <button onClick={() => handle("valider", c.id)} disabled={actionId === c.id}
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-50">
                  Valider
                </button>
                <button onClick={() => handle("refuser", c.id)} disabled={actionId === c.id}
                  className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50">
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