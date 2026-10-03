import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function initials(text) {
  return text
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ImageCarousel({ items, intervalMs = 5000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;
  const current = items[index];

  const Content = (
    <>
      {current.image ? (
        <img src={current.image} alt={current.title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
          <span className="font-display text-5xl text-paper/40">{initials(current.title)}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-6">
        {current.subtitle && (
          <span className="font-mono text-[11px] text-paper/70">{current.subtitle}</span>
        )}
        <p className="font-display text-2xl text-paper">{current.title}</p>
      </div>
    </>
  );

  return (
    <div className="relative h-72 overflow-hidden border border-line sm:h-96">
      {current.link ? (
        <Link to={current.link} className="relative block h-full w-full">
          {Content}
        </Link>
      ) : (
        <div className="relative h-full w-full">{Content}</div>
      )}

      {items.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? "bg-paper" : "bg-paper/40"
              }`}
              aria-label={`Aller à l'élément ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}