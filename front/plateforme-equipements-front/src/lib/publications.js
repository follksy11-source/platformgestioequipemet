export const TYPE_LABELS = {
  ARTICLE: "Article",
  ANNONCE: "Annonce",
  APPEL_A_PROJET: "Appel à projet",
  APPEL_A_CANDIDATURE: "Appel à candidature",
  APPEL_D_OFFRES: "Appel d'offres",
};

export const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const isAppel = (type) => typeof type === "string" && type.startsWith("APPEL");

const SOON_DAYS = 7;

// "OUVERT" | "BIENTOT" | "CLOTURE" | null (appel sans date de clôture)
export function getStatutAppel(dateCloture) {
  if (!dateCloture) return null;
  const diff = new Date(dateCloture).getTime() - Date.now();
  if (diff <= 0) return "CLOTURE";
  if (diff <= SOON_DAYS * 24 * 60 * 60 * 1000) return "BIENTOT";
  return "OUVERT";
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}