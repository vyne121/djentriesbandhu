import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Headphones, Play, X } from "lucide-react";
import { Link } from "react-router";
import { band } from "../content";
import { spotifyEmbed } from "../lib/utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

const PlayerContext = createContext<(url?: string | null) => void>(() => {});
export function usePlayer() { return useContext(PlayerContext); }
export function ListenButton({ label = "Belehallgatok", url, outline = false }: { label?: string; url?: string | null; outline?: boolean }) {
  const play = usePlayer();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <Button disabled={!ready} variant={outline ? "outline" : "default"} onClick={() => play(url)}><Play size={16} fill="currentColor" />{label}</Button>;
}
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [missing, setMissing] = useState<"general" | "release" | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  function choose(url?: string | null) {
    const next = spotifyEmbed(url === undefined ? band.releases[0]?.spotify ?? band.spotifyArtist : url);
    if (!next) { setMissing(url === undefined ? "general" : "release"); return; }
    if (next !== source) { setLoaded(false); setTimedOut(false); setSource(next); }
    setCollapsed(false);
  }
  useEffect(() => {
    if (!source || loaded) return;
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [source, loaded]);
  return <PlayerContext.Provider value={choose}>{children}<Dialog open={missing !== null} onOpenChange={open => { if (!open) setMissing(null); }}><DialogContent><DialogTitle className="dialog-title">Itt szól majd a Djentries.</DialogTitle><DialogDescription>{missing === "release" ? "Ez a megjelenés jelenleg nem hallgatható meg az oldalon." : "A Spotify-lejátszó a zenekar előadói vagy megjelenési linkjének megadása után válik elérhetővé. Addig a lejátszó helyét készítettük elő."}</DialogDescription></DialogContent></Dialog>{source && <aside className={`player ${collapsed ? "player-collapsed" : ""}`} aria-label="Spotify zenelejátszó"><div className="player-top"><span><Headphones size={15} />DJENTRIES <span className="muted">/ Spotify</span></span><div><button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Lejátszó kibontása" : "Lejátszó összecsukása"} aria-expanded={!collapsed}>{collapsed ? <ChevronUp size={19} /> : <ChevronDown size={19} />}</button><button onClick={() => setSource(null)} aria-label="Lejátszó bezárása és zene leállítása"><X size={19} /></button></div></div><div className="player-body" hidden={collapsed}>{!loaded && <p className="small" role="status">{timedOut ? "A lejátszó nem válaszol. Ellenőrizd a kapcsolatot, vagy hallgasd a Spotify-on." : "Spotify betöltése…"}</p>}<iframe data-testid="spotify-player" key={source} src={source} title="Djentries Spotify-lejátszó" width="100%" height="152" allow="encrypted-media; fullscreen; picture-in-picture" onLoad={() => { setLoaded(true); setTimedOut(false); }} /><p className="player-notice">A lejátszást a Spotify biztosítja. <a href={source.replace("/embed/", "/").split("?")[0]} target="_blank" rel="noopener noreferrer">Megnyitás Spotify-on ↗</a> · <Link to="/adatvedelem">Adatvédelem</Link></p></div></aside>}</PlayerContext.Provider>;
}
