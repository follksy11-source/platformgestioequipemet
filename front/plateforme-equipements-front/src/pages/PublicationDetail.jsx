import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { publicationsApi, mediaUrl } from "../services/api";
import { TYPE_LABELS, isAppel, formatDate } from "../lib/publications";
import AppelStatutBadge from "../components/AppelStatutBadge";
import Spinner from "../components/Spinner";

const PdfViewer = lazy(() => import("../components/PdfViewer"));

export default function PublicationDetail() {
  const { id } = useParams();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    publicationsApi
      .getById(id)
      .then(setPublication)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink/60">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm text-status-panne">
          {error || "Publication introuvable."}
        </p>
        <Link
          to="/actualites"
          className="mt-4 inline-block text-sm text-primary"
        >
          ← Retour aux actualités
        </Link>
      </div>
    );
  }

  const appel = isAppel(publication.type);
  const pdfUrl = mediaUrl(publication.fichierPdf);
  console.log("publication:", publication, "pdfUrl:", pdfUrl);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        to={appel ? "/appels" : "/actualites"}
        className="text-sm text-ink/60 hover:text-primary"
      >
        ← {appel ? "Appels" : "Actualités"}
      </Link>

      {publication.image && (
        <img
          src={mediaUrl(publication.image)}
          alt={publication.titre}
          className="mt-4 h-72 w-full border border-line object-cover"
        />
      )}

      <span className="mt-6 block font-mono text-xs text-primary">
        {TYPE_LABELS[publication.type] || publication.type}
      </span>
      <h1 className="mt-1 font-display text-3xl text-ink">
        {publication.titre}
      </h1>

      {appel && publication.dateCloture && (
        <div className="mt-4 flex items-center justify-between border border-line bg-paper px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              Date de clôture
            </p>
            <p className="font-display text-lg text-ink">
              {formatDate(publication.dateCloture)}
            </p>
          </div>
          <AppelStatutBadge dateCloture={publication.dateCloture} />
        </div>
      )}

      <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink/80">
        {publication.contenu}
      </p>

      {pdfUrl && (
        <div className="mt-8 border-t border-line pt-6">
          <h2 className="mb-3 font-display text-lg text-ink">
            Document complet
          </h2>
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 py-10 text-ink/60">
                <Spinner className="h-5 w-5" />
                <span className="text-sm">Chargement du lecteur...</span>
              </div>
            }
          >
            <PdfViewer url={pdfUrl} name={publication.nomFichierPdf} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
