import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { equipementsApi, reservationsApi } from "../services/api";
import DisponibiliteCalendar from "../components/DisponibiliteCalendar";
import Spinner from "../components/Spinner";

export default function Reservation() {
  const { equipementId } = useParams();
  const navigate = useNavigate();

  const [equipement, setEquipement] = useState(null);
  const [loadingEquip, setLoadingEquip] = useState(true);

  const [form, setForm] = useState({ dateDebut: "", dateFin: "", motif: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    equipementsApi
      .getById(equipementId)
      .then(setEquipement)
      .finally(() => setLoadingEquip(false));
  }, [equipementId]);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (new Date(form.dateFin) <= new Date(form.dateDebut)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    setLoading(true);
    try {
      await reservationsApi.create({
        equipementId: Number(equipementId),
        dateDebut: new Date(form.dateDebut).toISOString(),
        dateFin: new Date(form.dateFin).toISOString(),
        motif: form.motif,
      });
      setSuccess(true);
      setTimeout(() => navigate("/mes-reservations"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingEquip) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink/60">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-status-disponible">
          Demande de réservation envoyée avec succès.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <Link
        to={`/equipements/${equipementId}`}
        className="text-sm text-ink/60 hover:text-primary"
      >
        ← Retour à la fiche équipement
      </Link>

      <h1 className="mt-4 font-display text-2xl text-ink">
        Réserver : {equipement?.nom}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Votre demande sera soumise au responsable de l'équipement pour
        validation.
      </p>

      <div className="mt-6">
        <DisponibiliteCalendar equipementId={equipementId} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Début</span>
          <input
            type="datetime-local"
            required
            value={form.dateDebut}
            onChange={update("dateDebut")}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Fin</span>
          <input
            type="datetime-local"
            required
            value={form.dateFin}
            onChange={update("dateFin")}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Motif</span>
          <textarea
            rows={3}
            required
            value={form.motif}
            onChange={update("motif")}
            placeholder="Ex : Analyse d'un échantillon"
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-status-panne">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 bg-primary py-2.5 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50"
        >
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          {loading ? "Envoi..." : "Envoyer la demande"}
        </button>
      </form>
    </div>
  );
}
