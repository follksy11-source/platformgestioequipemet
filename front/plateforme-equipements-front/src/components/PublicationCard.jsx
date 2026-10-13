import { Link } from "react-router-dom";
import { mediaUrl } from "../services/api";
import { TYPE_LABELS, isAppel } from "../lib/publications";
import AppelStatutBadge from "./AppelStatutBadge";

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
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-primary">
            {TYPE_LABELS[publication.type] || publication.type}
          </span>
          {isAppel(publication.type) && (
            <AppelStatutBadge dateCloture={publication.dateCloture} />
          )}
        </div>
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
