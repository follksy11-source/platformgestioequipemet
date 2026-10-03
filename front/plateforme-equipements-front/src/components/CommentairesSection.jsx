import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { commentairesApi } from "../services/api";
import Spinner from "./Spinner";

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

export default function CommentairesSection({ equipementId }) {
  const { user } = useAuth();
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contenu, setContenu] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  function refresh() {
    setLoading(true);
    commentairesApi
      .getByEquipement(equipementId)
      .then((data) => setCommentaires(data.filter((c) => c.statut === "VALIDE")))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [equipementId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await commentairesApi.create({ contenu, equipementId: Number(equipementId) });
      setContenu("");
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-10 border-t border-line pt-6">
      <h2 className="font-display text-lg text-ink">
        Commentaires {commentaires.length > 0 && `(${commentaires.length})`}
      </h2>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-ink/60">
          <Spinner className="h-4 w-4" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}

      {!loading && commentaires.length === 0 && (
        <p className="mt-4 text-sm text-ink/60">Aucun commentaire pour le moment.</p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {commentaires.map((c) => (
          <div key={c.id} className="border-b border-line pb-4 last:border-none">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink">
                {c.auteur?.prenom} {c.auteur?.nom}
              </span>
              <span className="font-mono text-[11px] text-ink/40">{formatDate(c.date)}</span>
            </div>
            <p className="mt-1 text-sm text-ink/70">{c.contenu}</p>
          </div>
        ))}
      </div>

      {user ? (
        sent ? (
          <p className="mt-6 text-sm text-status-disponible">
            Commentaire envoyé, en attente de validation par un administrateur.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2">
            <textarea
              rows={3}
              required
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Laisser un commentaire sur cet équipement..."
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            {error && <p className="text-sm text-status-panne">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-fit items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting && <Spinner className="h-4 w-4 text-paper" />}
              Publier
            </button>
          </form>
        )
      ) : (
        <p className="mt-6 text-sm text-ink/50">Connectez-vous pour laisser un commentaire.</p>
      )}
    </div>
  );
}