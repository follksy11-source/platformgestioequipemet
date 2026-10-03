import { useState, useEffect } from "react";
import { utilisateursApi } from "../../services/api";
import StatutCompteBadge from "../../components/StatutCompteBadge";
import Spinner from "../../components/Spinner";

const ROLES = ["CHERCHEUR", "RESPONSABLE_EQUIPEMENT", "ADMINISTRATEUR"];

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [filter, setFilter] = useState("TOUS");

  function refresh() {
    setLoading(true);
    utilisateursApi
      .getAll()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handle(action, id, ...args) {
    setActionId(id);
    try {
      await utilisateursApi[action](id, ...args);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    handle("remove", id);
  }

  const filtered = filter === "TOUS" ? users : users.filter((u) => u.statutCompte === filter);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Utilisateurs</h1>
        <p className="mt-1 font-mono text-xs text-ink/50">{filtered.length} affiché(s)</p>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        {["EN_ATTENTE", "VALIDE", "BLOQUE", "TOUS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-medium ${filter === f ? "text-primary" : "text-ink/50 hover:text-ink"}`}
          >
            {f === "EN_ATTENTE" ? "En attente" : f === "VALIDE" ? "Validés" : f === "BLOQUE" ? "Bloqués" : "Tous"}
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

      <div className="mt-6 flex flex-col gap-px bg-line">
        {filtered.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-4 bg-paper p-4">
            <div>
              <p className="font-display text-base text-ink">{u.prenom} {u.nom}</p>
              <p className="text-xs text-ink/50">
                {u.email} · {u.laboratoire?.nom || "Sans laboratoire"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={u.role}
                onChange={(e) => handle("changerRole", u.id, e.target.value)}
                disabled={actionId === u.id}
                className="border border-line bg-paper px-2 py-1 text-xs focus:border-primary focus:outline-none disabled:opacity-50"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <StatutCompteBadge statut={u.statutCompte} />

              {u.statutCompte === "EN_ATTENTE" && (
                <>
                  <button
                    onClick={() => handle("valider", u.id)}
                    disabled={actionId === u.id}
                    className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => handle("refuser", u.id)}
                    disabled={actionId === u.id}
                    className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50"
                  >
                    Refuser
                  </button>
                </>
              )}

              <button
                onClick={() => handleDelete(u.id)}
                disabled={actionId === u.id}
                className="text-sm font-medium text-ink/40 hover:text-status-panne disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}