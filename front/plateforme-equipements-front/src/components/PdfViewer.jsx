import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Spinner from "./Spinner";

// Le worker doit être configuré dans le même module que Document/Page
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// Ne dessine la page que lorsqu'elle approche de l'écran
function LazyPage({ pageNumber, width }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(pageNumber <= 2);

  useEffect(() => {
    if (visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "600px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className="mb-3 flex justify-center"
      style={{ minHeight: visible ? undefined : width * 1.414 }} // ratio A4 en attendant
    >
      {visible && <Page pageNumber={pageNumber} width={width} />}
    </div>
  );
}

export default function PdfViewer({ url, name }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(false);

  // Adapte la largeur des pages à celle du conteneur (téléphone compris)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pageWidth = Math.min(width, 900);

  return (
    <div>
      <div className="flex items-center justify-between pb-2 text-xs text-ink/50">
        <span className="truncate pr-3">
          {name && <span className="font-medium text-ink/70">{name}</span>}
          {name && " · "}
          {numPages
            ? `${numPages} page${numPages > 1 ? "s" : ""}`
            : "Chargement..."}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Ouvrir dans un onglet
        </a>
      </div>

      <div
        ref={wrapRef}
        className="max-h-[80vh] overflow-y-auto border border-line bg-line/30 p-3"
      >
        {error ? (
          <p className="py-10 text-center text-sm text-status-panne">
            Impossible d'afficher le PDF ici. Utilise « Ouvrir dans un onglet ».
          </p>
        ) : (
          width > 0 && (
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => setError(true)}
              loading={
                <div className="flex items-center justify-center gap-2 py-10 text-ink/60">
                  <Spinner className="h-5 w-5" />
                  <span className="text-sm">Chargement...</span>
                </div>
              }
            >
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <LazyPage key={i + 1} pageNumber={i + 1} width={pageWidth} />
              ))}
            </Document>
          )
        )}
      </div>
    </div>
  );
}
