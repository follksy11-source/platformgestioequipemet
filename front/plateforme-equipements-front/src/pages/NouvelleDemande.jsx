import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { demandesApi } from "../services/api";
import Spinner from "../components/Spinner";

const TITLES = {
  REJOINDRE_LABORATOIRE: "Rejoindre un laboratoire",
  AJOUT_LABORATOIRE: "Créer un laboratoire",
  DEVENIR_RESPONSABLE: "Devenir responsable d'un équipement",
};

export default function NouvelleDemande() {
  const [params] = useSearchParams();
  const type = params.get("type") || "REJOINDRE_LABORATOIRE";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    laboratoireId: "",
    nomLaboratoire: "",
    descriptionLaboratoire: "",
    institutionId: "",
    equipementId: "",
    contenuDemande: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let payload = { type, contenuDemande: form.contenuDemande };
      if (type === "REJOINDRE_LABORATOIRE") {
        payload.laboratoireId = Number(form.laboratoireId);
      } else if (type === "AJOUT_LABORATOIRE") {
        payload.nomLaboratoire = form.nomLaboratoire;
        payload.descriptionLaboratoire = form.descriptionLaboratoire;
        payload.institutionId = Number(form.institutionId);
      } else if (type === "DEVENIR_RESPONSABLE") {
        payload.equipementId = Number(form.equipementId);
      }
      await demandesApi.create(payload);
      setSuccess(true);
      setTimeout(() => navigate("/mes-demandes"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-status-disponible">Demande envoyée avec succès.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-2xl text-ink">{TITLES[type]}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {type === "REJOINDRE_LABORATOIRE" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">ID du laboratoire</span>
            <input required type="number" value={form.laboratoireId} onChange={update("laboratoireId")}
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </label>
        )}

        {type === "AJOUT_LABORATOIRE" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink/80">Nom du laboratoire</span>
              <input required value={form.nomLaboratoire} onChange={update("nomLaboratoire")}
                className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink/80">Description</span>
              <textarea rows={2} value={form.descriptionLaboratoire} onChange={update("descriptionLaboratoire")}
                className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink/80">ID Institution</span>
              <input required type="number" value={form.institutionId} onChange={update("institutionId")}
                className="w-32 border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
          </>
        )}

        {type === "DEVENIR_RESPONSABLE" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">ID de l'équipement</span>
            <input required type="number" value={form.equipementId} onChange={update("equipementId")}
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Message</span>
          <textarea rows={3} required value={form.contenuDemande} onChange={update("contenuDemande")}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>

        {error && <p className="text-sm text-status-panne">{error}</p>}

        <button type="submit" disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 bg-primary py-2.5 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50">
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          {loading ? "Envoi..." : "Envoyer la demande"}
        </button>
      </form>
    </div>
  );
}
