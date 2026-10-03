import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  equipementsApi,
  laboratoiresApi,
  publicationsApi,
  mediaUrl,
} from "../services/api";
import StatusBadge from "../components/StatusBadge";
import LaboratoireStatusCard from "../components/LaboratoireStatusCard";
import ImageCarousel from "../components/ImageCarousel";
import PublicationCard from "../components/PublicationCard";
import Spinner from "../components/Spinner";
import FactsSection from "../components/FactsSection";

const TYPE_LABELS = {
  ARTICLE: "Article",
  ANNONCE: "Annonce",
  APPEL_A_PROJET: "Appel à projet",
  APPEL_A_CANDIDATURE: "Appel à candidature",
};

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recents, setRecents] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([equipementsApi.getAll(), laboratoiresApi.getAll()])
      .then(([equipements, labos]) => {
        setStats({ equipements: equipements.length, labos: labos.length });
        setRecents(equipements.slice(-5).reverse());
      })
      .finally(() => setLoading(false));

    publicationsApi
      .getAll()
      .then(setPublications)
      .catch(() => setPublications([]));
  }, []);

  const publicationCarouselItems = publications.slice(0, 5).map((p) => ({
    title: p.titre,
    subtitle: TYPE_LABELS[p.type] || p.type,
    image: mediaUrl(p.image),
    link: `/publications/${p.id}`,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Bandeau d'intro */}
      <div className="border-b border-line pb-8">
        <span className="font-mono text-xs text-ink/50">
          ANSSN · LaMERE · Université de Kara
        </span>
        <h1 className="mt-2 font-display text-4xl text-ink">
          Plateforme de gestion des équipements scientifiques
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink/70">
          Consultez le catalogue des équipements financés par les projets AIEA,
          réservez un créneau d'utilisation, et échangez directement avec les
          responsables de laboratoire.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/catalogue"
            className="bg-primary px-5 py-2.5 text-sm font-medium text-paper hover:bg-primary-dark"
          >
            Voir le catalogue
          </Link>
          {!user && (
            <Link
              to="/register"
              className="border border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-paper"
            >
              Créer un compte
            </Link>
          )}
        </div>
      </div>

      {/* Carrousel de publications */}
      {!loading && publicationCarouselItems.length > 0 && (
        <div className="mt-8">
          <ImageCarousel items={publicationCarouselItems} />
        </div>
      )}

      {/* Facts (3D) */}
      <FactsSection />

      {/* Bandeau labo si connecté */}
      {user && (
        <div className="mt-8">
          <LaboratoireStatusCard />
        </div>
      )}

      {/* Stats rapides */}
      {!loading && stats && (
        <div className="mt-8 grid grid-cols-2 gap-px bg-line">
          <div className="border border-line bg-paper p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              Équipements référencés
            </p>
            <p className="mt-2 font-display text-3xl text-ink">
              {stats.equipements}
            </p>
          </div>
          <div className="border border-line bg-paper p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              Laboratoires partenaires
            </p>
            <p className="mt-2 font-display text-3xl text-ink">{stats.labos}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-8 flex items-center justify-center gap-2 py-12 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}

      {/* Publications / actualités AIEA */}
      {publications.length > 0 && (
        <div className="mt-10">
          <div className="flex items-end justify-between border-b border-line pb-3">
            <h2 className="font-display text-xl text-ink">
              Actualités & appels AIEA
            </h2>
            <Link
              to="/publications"
              className="text-sm text-primary hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
            {publications.slice(0, 3).map((p) => (
              <PublicationCard key={p.id} publication={p} />
            ))}
          </div>
        </div>
      )}

      {/* Équipements récents */}
      {!loading && recents.length > 0 && (
        <div className="mt-10">
          <div className="flex items-end justify-between border-b border-line pb-3">
            <h2 className="font-display text-xl text-ink">Récemment ajoutés</h2>
            <Link
              to="/catalogue"
              className="text-sm text-primary hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
            {recents.slice(0, 3).map((eq) => (
              <Link
                key={eq.id}
                to={`/equipements/${eq.id}`}
                className="flex flex-col gap-2 bg-paper p-5 transition-colors hover:bg-primary/5"
              >
                <h3 className="font-display text-base text-ink">{eq.nom}</h3>
                <StatusBadge statut={eq.disponibilite} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
