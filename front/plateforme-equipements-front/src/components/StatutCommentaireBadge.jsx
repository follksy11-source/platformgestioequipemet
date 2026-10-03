const CONFIG = {
  EN_ATTENTE: { label: "En attente", color: "bg-status-maintenance" },
  VALIDE: { label: "Validé", color: "bg-status-disponible" },
  REFUSE: { label: "Refusé", color: "bg-status-panne" },
};

export default function StatutCommentaireBadge({ statut }) {
  const config = CONFIG[statut] || { label: statut, color: "bg-ink/40" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/80">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}