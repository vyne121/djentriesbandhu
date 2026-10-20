import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowDownLeft, ArrowUpRight, Check, Copy, Download, Mail, Phone, Play, Radio } from "lucide-react";
import { band, brandAssets, pageAvailable } from "../content";
import { Button } from "./ui/button";
import { ContactForm } from "./contact-form";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { safeExternalUrl } from "../lib/utils";

export function Kicker({ children, number }: { children: ReactNode; number?: string }) {
  return <p className="kicker">{number && <span className="section-number">{number} /</span>}{children}</p>;
}
export function PageHeading({ number, label, title, text }: { number: string; label: string; title: string; text?: string }) {
  return <header className="page-heading wrap"><Kicker number={number}>{label}</Kicker><h1>{title}{!/[.!?…]$/.test(title.trim()) && <span className="accent">.</span>}</h1>{text && <p className="lead">{text}</p>}</header>;
}
export function SectionHeader({ number, label, title, href, link }: { number: string; label: string; title: string; href?: string; link?: string }) {
  return <div className="section-heading"><div><Kicker number={number}>{label}</Kicker><h2>{title}{!/[.!?…]$/.test(title.trim()) && <span className="accent">.</span>}</h2></div>{href && pageAvailable(href) && <Link className="text-link" to={href}>{link}<ArrowUpRight size={18} /></Link>}</div>;
}
export function Placeholder({ children }: { children: ReactNode }) { return band.preview ? <p className="preview-note"><span />{children}</p> : null; }
const socialIcons: Record<string, string> = { Facebook: "facebook", TikTok: "tiktok", Instagram: "instagram", YouTube: "youtube", Spotify: "spotify", "Apple Music": "applemusic" };
export function SocialLinks() {
  return <div className="social-links">{band.socials.filter(s => safeExternalUrl(s.url)).map(s => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
    {socialIcons[s.name] && <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><use href={`/images/social-icons.svg#${socialIcons[s.name]}`} /></svg>}
    <span>{s.name}</span>
  </a>)}</div>;
}

export function Booking({ compact = false }: { compact?: boolean }) {
  const [copy, setCopy] = useState<"idle" | "done" | "failed">("idle");
  async function copyEmail() { try { await navigator.clipboard.writeText(band.booking.email!); setCopy("done"); } catch { setCopy("failed"); } }
  return <section className={`booking ${compact ? "booking-compact" : ""}`} id="kapcsolat"><div className="wrap booking-grid"><div><Kicker>Booking & kapcsolat</Kicker><h2>Találkozzunk<br />a színpad előtt!</h2><p>Koncert, fesztivál vagy együttműködés?<br />Beszéljünk róla!</p><div className="booking-details">{band.booking.email ? <><a className="booking-email" href={`mailto:${band.booking.email}`}>{band.booking.email}<ArrowUpRight /></a><button className="copy-email" onClick={copyEmail}>{copy === "done" ? <Check size={16} /> : <Copy size={16} />}{copy === "done" ? "E-mail-cím másolva" : "E-mail-cím másolása"}</button><p role="status" className="small">{copy === "failed" ? "A másolás nem sikerült. Jelöld ki az e-mail-címet, vagy nyisd meg a levelezőt." : ""}</p></> : <><Mail size={26} /><h3>Booking elérhetőség</h3><Placeholder>A kapcsolattartó e-mail-címe hamarosan.</Placeholder></>}{band.booking.phone && <a className="phone-link" href={`tel:${band.booking.phone.replace(/[^+\d]/g, "")}`}><Phone size={16} />{band.booking.phone}</a>}<SocialLinks /></div></div><ContactForm /></div></section>;
}

export function Downloads() { return <div className="downloads">{band.downloads.filter(d => d.href || band.preview).map(d => <div className="download-row" key={d.label}><div><h3>{d.label}</h3><p>{d.detail}</p></div>{d.href ? <a className="download-action" href={d.href} download aria-label={`${d.label} letöltése`}><Download size={21} /></a> : <span className="small muted">Előkészítés alatt <Download size={17} /></span>}</div>)}</div>; }

export function FeaturedVideo() {
  const video = band.video;
  const label = video.kind === "lyric" ? "Dalszövegvideó" : video.kind === "music" ? "Videóklip" : "Koncertvideó";
  const validVideo = !!video.youtubeId && /^[\w-]{11}$/.test(video.youtubeId);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="video-poster" aria-label={`${video.title} - ${label.toLowerCase()} megnyitása`}>
          <img src={video.poster} alt={`${video.title} borító`} width="1000" height="1000" loading="lazy" />
          <span className="video-shade" />
          <span className="video-play"><Play fill="currentColor" size={28} /></span>
          <span className="video-caption">
            <span className="kicker">{label}</span><strong>{video.title}</strong>
            <span className="small">{validVideo ? `${label} megnyitása` : `${label} · a videólink megadására vár`}<ArrowUpRight size={16} /></span>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="dialog-title">{video.title} - {label.toLowerCase()}</DialogTitle>
        <DialogDescription>
          {validVideo ? "A lejátszó betöltésével kapcsolat létesül a YouTube-bal. A videó nem indul el automatikusan." : "A dalszövegvideó linkje még nincs megadva. A megjelenés után a videóklip válthatja fel ezen a helyen."}
        </DialogDescription>
        {validVideo && <iframe className="youtube-frame" src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=0`} title={`${video.title} - ${label.toLowerCase()}`} allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen />}
      </DialogContent>
    </Dialog>
  );
}

export function MerchPreview({ full = false }: { full?: boolean }) {
  if (!band.preview && !band.shopify) return null;
  if (band.shopify) return <div className="merch-banner"><h3>Djentries merch.</h3><p>Fedezd fel a zenekar hivatalos termékeit a shopban.</p><Button asChild variant="outline"><Link to="/shop">Nézd meg a termékeket!<ArrowUpRight size={17} /></Link></Button></div>;
  return <div className={`merch-preview ${full ? "merch-full" : ""}`}><div className="merch-art"><img src={brandAssets.merchPreview} alt="Djentries póló a zenekar pulykás logójával - látványterv, nem rendelhető" width="600" height="600" loading="lazy" /><span className="merch-tag">Látványterv / 01</span></div><div className="merch-copy"><h3>Vidd magaddal a hangzást</h3><p className="merch-subtitle">A színpadtól az utcáig.</p><p>A Djentries világa, amit magadon viselhetsz.</p><Placeholder>Termékterv. A végleges kínálat és árak a Shopify-ból érkeznek.</Placeholder>{!full && <Button asChild variant="outline"><Link to="/shop">Nézd meg a termékeket!<ArrowUpRight size={17} /></Link></Button>}</div></div>;
}

export function NotAvailable({ children }: { children: ReactNode }) { return <div className="empty-state"><Radio size={28} className="accent" /><h3>Hamarosan itt találod.</h3><p>{children}</p></div>; }
export function BackHome() { return <Button asChild variant="outline"><Link to="/"><ArrowDownLeft size={18} />Vissza a főoldalra</Link></Button>; }
