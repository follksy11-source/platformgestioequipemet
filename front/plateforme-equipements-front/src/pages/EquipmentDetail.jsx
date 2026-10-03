import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { equipementsApi } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";
import CommentairesSection from "../components/CommentairesSection";
import RapportForm from "../components/RapportForm";
import TravauxSection from "../components/TravauxSection";
import Model3DViewer from "../components/Model3DViewer";
import DisponibiliteCalendar from "../components/DisponibiliteCalendar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getMediaUrl = (path) => {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
};

export default function EquipmentDetail() {
  const { id } = useParams();
  const [equipement, setEquipement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    equipementsApi
      .getById(id)
      .then(setEquipement)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink/60">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Chargement de la fiche...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm text-status-panne">{error}</p>
        <Link
          to="/catalogue"
          className="mt-4 inline-block text-sm text-primary"
        >
          ← Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/catalogue" className="text-sm text-ink/60 hover:text-primary">
        ← Catalogue
      </Link>
      { console.log("photo:", equipement.photo)}
      <div className="mt-4 flex items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="font-mono text-xs text-ink/40">
            #{String(equipement.id).padStart(4, "0")}
          </span>
          <h1 className="mt-1 font-display text-3xl text-ink">
            {equipement.nom}
          </h1>
          {equipement.laboratoire?.nom && (
            <p className="mt-1 text-sm text-ink/60">
              {equipement.laboratoire.nom}
            </p>
          )}
        </div>
        <StatusBadge statut={equipement.disponibilite} />
      </div>

      {equipement.description && (
        <p className="mt-6 text-sm leading-relaxed text-ink/80">
          {equipement.description}
        </p>
      )}

      {equipement.caracteristiquesTechniques && (
        <div className="mt-6">
          <h2 className="font-display text-lg text-ink">
            Caractéristiques techniques
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-ink/70">
            {equipement.caracteristiquesTechniques}
          </p>
        </div>
      )}

      {equipement.modele3D && (
        <Model3DViewer
          glbUrl={getMediaUrl(equipement.modele3D)}
          className="mt-6 h-96"
        />
      )}

      <div className="mt-6">
        <h2 className="font-display text-lg text-ink">Disponibilité</h2>
        <div className="mt-2">
          <DisponibiliteCalendar equipementId={equipement.id} />
        </div>
      </div>

      <div className="mt-8 flex gap-3 border-t border-line pt-6">
        <Link
          to={`/reservation/${equipement.id}`}
          className="bg-primary px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-primary-dark"
        >
          Réserver cet équipement
        </Link>
        <Link
          to={`/contact/${equipement.id}`}
          className="border border-primary px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-paper"
        >
          Contacter le responsable
        </Link>
      </div>
      <CommentairesSection equipementId={equipement.id} />
      {user && (
        <div className="mt-10 border-t border-line pt-6">
          <h2 className="font-display text-lg text-ink">
            Rapport d'utilisation
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            Si vous avez utilisé cet équipement, vous pouvez soumettre un
            rapport.
          </p>
          <RapportForm equipementId={equipement.id} />
        </div>
      )}
      <TravauxSection equipementId={equipement.id} />
    </div>
  );
}
