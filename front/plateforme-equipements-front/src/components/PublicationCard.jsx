import { Link } from "react-router-dom";
import { mediaUrl } from "../services/api";

const TYPE_LABELS = {
  ARTICLE: "Article",
  ANNONCE: "Annonce",
  APPEL_A_PROJET: "Appel à projet",
  APPEL_A_CANDIDATURE: "Appel à candidature",
};

export default function PublicationCard({ publication }) {
  return (
    <Link
      to={`/publications/${publication.id}`}
      className="flex flex-col bg-paper transition-colors hover:bg-primary/5"
    >
      <div className="flex h-36 items-center justify-center overflow-hidden bg-line/40">
        {publication.image && (
          <img
            src={mediaUrl(publication.image)}
            alt={publication.titre}
            className="h-36 w-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <span className="font-mono text-[11px] text-primary">
          {TYPE_LABELS[publication.type] || publication.type}
        </span>
        <p className="mt-1 font-display text-base text-ink">
          {publication.titre}
        </p>
        {publication.contenu && (
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">
            {publication.contenu}
          </p>
        )}
      </div>
    </Link>
  );
}
