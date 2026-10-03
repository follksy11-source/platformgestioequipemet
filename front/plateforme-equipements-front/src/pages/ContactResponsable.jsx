import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { equipementsApi, messagesApi } from "../services/api";
import Spinner from "../components/Spinner";

export default function ContactResponsable() {
  const { equipementId } = useParams();
  const navigate = useNavigate();

  const [equipement, setEquipement] = useState(null);
  const [loadingEquip, setLoadingEquip] = useState(true);
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    equipementsApi
      .getById(equipementId)
      .then(setEquipement)
      .finally(() => setLoadingEquip(false));
  }, [equipementId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await messagesApi.send({
        destinataireId: equipement.responsable.id,
        contenu,
        equipementId: Number(equipementId),
      });
      setSuccess(true);
      setTimeout(() => navigate(`/equipements/${equipementId}`), 1500);
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

  if (!equipement?.responsable) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm text-ink/60">
          Cet équipement n'a pas encore de responsable assigné.
        </p>
        <Link to={`/equipements/${equipementId}`} className="mt-4 inline-block text-sm text-primary">
          ← Retour à la fiche équipement
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-status-disponible">Message envoyé avec succès.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <Link to={`/equipements/${equipementId}`} className="text-sm text-ink/60 hover:text-primary">
        ← Retour à la fiche équipement
      </Link>

      <h1 className="mt-4 font-display text-2xl text-ink">
        Contacter {equipement.responsable.prenom} {equipement.responsable.nom}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Responsable de : {equipement.nom}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Votre message</span>
          <textarea
            rows={5}
            required
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Bonjour, je voudrais avoir des informations sur cet équipement."
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
          {loading ? "Envoi..." : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}