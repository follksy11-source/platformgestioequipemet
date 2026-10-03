import { useState } from "react";
import Spinner from "./Spinner";

export default function TravailForm({ initial, equipementId, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    titre: initial?.titre || "",
    description: initial?.description || "",
    date: initial?.date ? initial.date.slice(0, 10) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ ...form, equipementId: Number(equipementId) });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border border-line bg-paper p-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Titre</span>
        <input required value={form.titre} onChange={update("titre")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Description</span>
        <textarea rows={3} value={form.description} onChange={update("description")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Date</span>
        <input type="date" value={form.date} onChange={update("date")}
          className="w-48 border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      {error && <p className="text-sm text-status-panne">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50">
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          {initial ? "Enregistrer" : "Publier"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-ink/60 hover:text-ink">
          Annuler
        </button>
      </div>
    </form>
  );
}