import { useState } from "react";
import { rapportsApi } from "../services/api";
import Spinner from "./Spinner";

export default function RapportForm({ equipementId, onSent }) {
  const [open, setOpen] = useState(false);
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await rapportsApi.create({ contenu, equipementId: Number(equipementId) });
      setSent(true);
      onSent?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="mt-6 text-sm text-status-disponible">
        Rapport envoyé, en attente de validation par un administrateur.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-paper"
      >
        Rédiger un rapport d'utilisation
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2">
      <textarea
        rows={4}
        required
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        placeholder="Décrivez l'utilisation de l'équipement (résultats, anomalies éventuelles...)"
        className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      {error && <p className="text-sm text-status-panne">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50"
        >
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          Envoyer
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-medium text-ink/60 hover:text-ink">
          Annuler
        </button>
      </div>
    </form>
  );
}