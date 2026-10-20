import { useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Release } from "../content";
import { ListenButton } from "./player";
import { Button } from "./ui/button";

export function ReleaseCarousel({ releases }: { releases: Release[] }) {
  const [active, setActive] = useState(0);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const release = releases[active];
  if (!release) return null;
  const move = (direction: number) => setActive(index => (index + direction + releases.length) % releases.length);

  return <div className="release-carousel" role="region" aria-roledescription="lapozó" aria-label="Megjelenések" tabIndex={0}
    onKeyDown={event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }
    }}>
    <div className="release-orbit"
      onPointerDown={event => { gesture.current = { x: event.clientX, y: event.clientY }; swiped.current = false; }}
      onPointerCancel={() => { gesture.current = null; }}
      onPointerUp={event => {
        if (!gesture.current) return;
        const dx = event.clientX - gesture.current.x;
        const dy = event.clientY - gesture.current.y;
        gesture.current = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true;
          move(dx < 0 ? 1 : -1);
        }
      }}
      onClickCapture={event => {
        if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; }
      }}>
      {releases.map((item, index) => {
        let offset = releases.length === 2 ? index - active : (index - active + releases.length) % releases.length;
        if (offset > releases.length / 2) offset -= releases.length;
        const hidden = Math.abs(offset) > 2;
        const style = {
          "--offset": offset,
          "--depth": `${-Math.abs(offset) * 180}px`,
          "--angle": `${offset * 44}deg`,
          zIndex: releases.length - Math.abs(offset),
        } as CSSProperties;
        return <button key={item.title} className="release-cover" style={style} data-offset={offset}
          aria-label={`Megjelenés kiválasztása: ${item.title}`} aria-pressed={index === active}
          aria-hidden={hidden || undefined} tabIndex={hidden ? -1 : 0} hidden={hidden}
          onClick={() => setActive(index)}>
          <img src={item.artwork} alt={`${item.title} borító`} width="700" height="700" draggable={false} />
        </button>;
      })}
    </div>
    <div className="release-carousel-controls">
      <Button variant="outline" className="button-icon" aria-label="Előző megjelenés" disabled={releases.length < 2} onClick={() => move(-1)}><ArrowLeft size={20} /></Button>
      <p className="release-position" role="status" aria-live="polite" aria-atomic="true">{active + 1} / {releases.length} - {release.title}</p>
      <Button variant="outline" className="button-icon" aria-label="Következő megjelenés" disabled={releases.length < 2} onClick={() => move(1)}><ArrowRight size={20} /></Button>
    </div>
    <div className="release-carousel-details">
      <p className="kicker">{release.kind}{release.year ? ` / ${release.year}` : ""}</p>
      <h2>{release.title}</h2>
      <ListenButton label="Hallgasd meg Spotify-on!" url={release.spotify} />
    </div>
  </div>;
}
