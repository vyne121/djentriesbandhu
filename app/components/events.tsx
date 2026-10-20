import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, Radio } from "lucide-react";
import { band } from "../content";
import { Button } from "./ui/button";
import { Placeholder } from "./site";
import { safeExternalUrl } from "../lib/utils";

export function Events({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(false);
  const [state, setState] = useState("loading");
  const frame = useRef<HTMLIFrameElement>(null);
  const artist = band.bandsintown;
  useEffect(() => {
    if (!active || !artist) return;
    const timer = setTimeout(() => setState("error"), 18000);
    function receive(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.data?.source !== "djentries-events") return;
      if (["ready", "error"].includes(event.data.status)) { setState(event.data.status); clearTimeout(timer); }
      if (typeof event.data.height === "number") frame.current!.style.height = `${Math.min(Math.max(event.data.height, 250), 3000)}px`;
    }
    window.addEventListener("message", receive);
    return () => { clearTimeout(timer); window.removeEventListener("message", receive); };
  }, [active, artist]);
  const artistName = artist ? artist.artist.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)) : "";
  const doc = `<!doctype html><html lang="hu"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0b241f;color:#e6ddbe;font-family:Arial,sans-serif}a{color:#b9cab1}</style></head><body><a class="bit-widget-initializer" data-artist-name="${artistName}" data-display-limit="${compact ? 3 : "all"}" data-background-color="#0b241f" data-text-color="#e6ddbe" data-link-color="#b9cab1" data-display-past-dates="false" data-language="hu"></a><script>function report(status){parent.postMessage({source:'djentries-events',status,height:document.body.scrollHeight},'*')}new MutationObserver(()=>{if(document.querySelector('.bit-widget'))report('ready')}).observe(document.body,{subtree:true,childList:true});new ResizeObserver(()=>report()).observe(document.body);</script><script src="https://widgetv3.bandsintown.com/main.min.js" onerror="report('error')"></script></body></html>`;
  if (!artist) return <div className="events-placeholder"><div className="event-date"><CalendarDays size={32} /><span>ÉLŐBEN</span></div><div><h3>A következő találkozás.</h3><p>A koncertdátumok hamarosan itt.</p><Placeholder>A Bandsintown-profil csatlakoztatására várunk.</Placeholder></div><Radio size={26} className="event-radio" /></div>;
  return <div className="events-embed">{!active ? <div className="activation"><CalendarDays size={25} className="accent" /><div><h3>Találkozzunk élőben.</h3><p>A dátumok betöltésével kapcsolat létesül a Bandsintownnal.</p></div><Button onClick={() => { setState("loading"); setActive(true); }}>Koncertek betöltése<ArrowUpRight size={16} /></Button></div> : <><p className="small muted" role="status">{state === "loading" ? "Koncertek betöltése…" : state === "error" ? "A koncertlista most nem tölthető be. Ez nem jelenti azt, hogy nincs közelgő koncert." : "A koncertlistát a Bandsintown szolgáltatja."}</p><iframe ref={frame} title="Djentries koncertjei a Bandsintownon" srcDoc={doc} className="events-frame" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" />{state === "error" && <Button variant="outline" onClick={() => setActive(false)}>Újrapróbálom</Button>}</>}{safeExternalUrl(artist.url) && <a className="text-link mt-6" href={artist.url} target="_blank" rel="noopener noreferrer">Djentries a Bandsintownon<ArrowUpRight size={16} /></a>}</div>;
}
