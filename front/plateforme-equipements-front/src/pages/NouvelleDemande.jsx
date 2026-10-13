import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  demandesApi,
  laboratoiresApi,
  institutionsApi,
  equipementsApi,
} from "../services/api";
import Spinner from "../components/Spinner";

const TYPES = [
  {
    value: "REJOINDRE_LABORATOIRE",
    label: "Rejoindre un laboratoire",
    help: "Demandez à être rattaché à un laboratoire existant.",
  },
  {
    value: "AJOUT_LABORATOIRE",
    label: "Créer un laboratoire",
    help: "Proposez un laboratoire absent de la plateforme. S'il est validé, vous en devenez le responsable.",
  },
  {
    value: "DEVENIR_RESPONSABLE",
    label: "Devenir responsable d'un équipement",
    help: "Demandez à gérer un équipement : fiche, calendrier et réservations.",
  },
];

const inputClass =
  "border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none";

export default function NouvelleDemande() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const urlType = params.get("type");
  const [type, setType] = useState(
    TYPES.some((t) => t.value === urlType)
      ? urlType
      : user?.laboratoireId
        ? "DEVENIR_RESPONSABLE"
        : "REJOINDRE_LABORATOIRE",
  );

  const [labos, setLabos] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    laboratoireId: "",
    nomLaboratoire: "",
    descriptionLaboratoire: "",
    institutionId: "",
    equipementId: params.get("equipementId") || "",
    contenuDemande: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      laboratoiresApi.getAll(),
      institutionsApi.getAll(),
      equipementsApi.getAll(),
    ])
      .then(([l, i, e]) => {
        if (l.status === "fulfilled")
          setLabos(l.value.filter((x) => x.statut === "VALIDE"));
        if (i.status === "fulfilled") setInstitutions(i.value);
        if (e.status === "fulfilled") setEquipements(e.value);
      })
      .finally(() => setLoadingData(false));
  }, []);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function changeType(value) {
    setType(value);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { type, contenuDemande: form.contenuDemande };
      if (type === "REJOINDRE_LABORATOIRE") {
        payload.laboratoireId = Number(form.laboratoireId);
      } else if (type === "AJOUT_LABORATOIRE") {
        payload.nomLaboratoire = form.nomLaboratoire;
        payload.descriptionLaboratoire = form.descriptionLaboratoire;
        payload.institutionId = Number(form.institutionId);
      } else {
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
        <p className="text-sm text-status-disponible">
          Demande envoyée. Un administrateur va l'examiner.
        </p>
      </div>
    );
  }

  const current = TYPES.find((t) => t.value === type);
  const laboOptions = labos.filter((l) => l.id !== user?.laboratoireId);
  const equipementOptions = equipements.filter(
    (eq) => eq.responsableId !== user?.id,
  );

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <div className="flex items-end justify-between border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Nouvelle demande</h1>
        <Link
          to="/mes-demandes"
          className="text-sm text-primary hover:underline"
        >
          Mes demandes →
        </Link>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => changeType(t.value)}
            className={`border p-3 text-left text-sm font-medium transition-colors ${
              type === t.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-line text-ink/70 hover:border-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink/60">{current.help}</p>

      {loadingData ? (
        <div className="mt-8 flex items-center gap-2 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {type === "REJOINDRE_LABORATOIRE" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink/80">
                Laboratoire
              </span>
              <select
                required
                value={form.laboratoireId}
                onChange={update("laboratoireId")}
                className={inputClass}
              >
                <option value="">Sélectionner...</option>
                {laboOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nom}
                  </option>
                ))}
              </select>
            </label>
          )}

          {type === "AJOUT_LABORATOIRE" && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink/80">
                  Nom du laboratoire
                </span>
                <input
                  required
                  value={form.nomLaboratoire}
                  onChange={update("nomLaboratoire")}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink/80">
                  Description
                </span>
                <textarea
                  rows={2}
                  value={form.descriptionLaboratoire}
                  onChange={update("descriptionLaboratoire")}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink/80">
                  Institution
                </span>
                <select
                  required
                  value={form.institutionId}
                  onChange={update("institutionId")}
                  className={inputClass}
                >
                  <option value="">Sélectionner...</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nom}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {type === "DEVENIR_RESPONSABLE" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink/80">
                Équipement
              </span>
              <select
                required
                value={form.equipementId}
                onChange={update("equipementId")}
                className={inputClass}
              >
                <option value="">Sélectionner...</option>
                {equipementOptions.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom}
                    {eq.laboratoire?.nom ? ` — ${eq.laboratoire.nom}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">
              Message à l'administrateur
            </span>
            <textarea
              rows={3}
              required
              value={form.contenuDemande}
              onChange={update("contenuDemande")}
              placeholder="Expliquez brièvement votre demande."
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm text-status-panne">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary py-2.5 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50"
          >
            {loading && <Spinner className="h-4 w-4 text-paper" />}
            {loading ? "Envoi..." : "Envoyer la demande"}
          </button>
        </form>
      )}
    </div>
  );
}
