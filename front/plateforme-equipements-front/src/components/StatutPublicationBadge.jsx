const CONFIG = {
  BROUILLON: { label: "Brouillon", color: "bg-ink/40" },
  PUBLIE: { label: "Publié", color: "bg-status-disponible" },
};

export default function StatutPublicationBadge({ statut }) {
  const config = CONFIG[statut] || { label: statut, color: "bg-ink/40" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/80">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}