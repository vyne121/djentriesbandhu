import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowDownLeft, ArrowUpRight, Check, Copy, Download, Mail, Phone, Play, Radio } from "lucide-react";
import { band, pageAvailable } from "../content";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { safeExternalUrl } from "../lib/utils";

export function Kicker({ children, number }: { children: ReactNode; number?: string }) {
  return <p className="kicker">{number && <span className="section-number">{number} /</span>}{children}</p>;
}
export function PageHeading({ number, label, title, text }: { number: string; label: string; title: string; text: string }) {
  return <header className="page-heading wrap"><Kicker number={number}>{label}</Kicker><h1>{title}<span className="accent">.</span></h1><p className="lead">{text}</p></header>;
}
export function SectionHeader({ number, label, title, href, link }: { number: string; label: string; title: string; href?: string; link?: string }) {
  return <div className="section-heading"><div><Kicker number={number}>{label}</Kicker><h2>{title}<span className="accent">.</span></h2></div>{href && pageAvailable(href) && <Link className="text-link" to={href}>{link}<ArrowUpRight size={18} /></Link>}</div>;
}
export function Placeholder({ children }: { children: ReactNode }) { return band.preview ? <p className="preview-note"><span />{children}</p> : null; }
export function SocialLinks() { return <div className="social-links">{band.socials.filter(s => safeExternalUrl(s.url)).map(s => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.name}<ArrowUpRight size={14} /></a>)}</div>; }

export function Booking({ compact = false }: { compact?: boolean }) {
  const [copy, setCopy] = useState<"idle" | "done" | "failed">("idle");
  async function copyEmail() { try { await navigator.clipboard.writeText(band.booking.email!); setCopy("done"); } catch { setCopy("failed"); } }
  return <section className={`booking ${compact ? "booking-compact" : ""}`} id="kapcsolat"><div className="wrap booking-grid"><div><Kicker>Booking & kapcsolat</Kicker><h2>Találkozzunk<br />a színpad előtt<span>.</span></h2><p>Koncert, fesztivál vagy együttműködés?<br />Itt indul a következő közös történet.</p></div><div className="booking-details">{band.booking.email ? <><a className="booking-email" href={`mailto:${band.booking.email}`}>{band.booking.email}<ArrowUpRight /></a><button className="copy-email" onClick={copyEmail}>{copy === "done" ? <Check size={16} /> : <Copy size={16} />}{copy === "done" ? "E-mail-cím másolva" : "E-mail-cím másolása"}</button><p role="status" className="small">{copy === "failed" ? "A másolás nem sikerült. Jelöld ki az e-mail-címet, vagy nyisd meg a levelezőt." : ""}</p></> : <><Mail size={26} /><h3>Booking elérhetőség</h3><Placeholder>A kapcsolattartó e-mail-címe hamarosan.</Placeholder></>}{band.booking.phone && <a className="phone-link" href={`tel:${band.booking.phone.replace(/[^+\d]/g, "")}`}><Phone size={16} />{band.booking.phone}</a>}<SocialLinks /></div></div></section>;
}

export function Downloads() { return <div className="downloads">{band.downloads.filter(d => d.href || band.preview).map(d => <div className="download-row" key={d.label}><div><h3>{d.label}</h3><p>{d.detail}</p></div>{d.href ? <a className="download-action" href={d.href} download aria-label={`${d.label} letöltése`}><Download size={21} /></a> : <span className="small muted">Előkészítés alatt <Download size={17} /></span>}</div>)}</div>; }

export function LiveVideo() {
  const validVideo = !!band.liveVideoId && /^[\w-]{11}$/.test(band.liveVideoId);
  return <Dialog><DialogTrigger asChild><button className="video-poster" aria-label="Élő koncertvideó megnyitása">{(band.livePhoto || band.preview) && <img src={band.livePhoto ?? "/images/stage.jpg"} alt={band.livePhoto ? "Djentries élőben" : "Illusztráció: élő rockkoncert"} width="1400" height="933" loading="lazy" />}<span className="video-shade" /><span className="video-play"><Play fill="currentColor" size={28} /></span><span className="video-caption"><span className="kicker">A színpadon vagyunk otthon</span><strong>ÉREZD ÉLŐBEN.</strong><span className="small">{validVideo ? "Koncertvideó megnyitása" : "Videó helye · hangulatkép"}<ArrowUpRight size={16} /></span></span></button></DialogTrigger><DialogContent><DialogTitle className="dialog-title">Djentries élőben</DialogTitle><DialogDescription>{validVideo ? "A lejátszó betöltésével kapcsolat létesül a YouTube-bal. A videó nem indul el automatikusan." : "A zenekar jóváhagyott koncertvideója ide kerül. A látványterv hangulatképet használ."}</DialogDescription>{validVideo && <iframe className="youtube-frame" src={`https://www.youtube-nocookie.com/embed/${band.liveVideoId}?autoplay=0`} title="Djentries koncertvideó" allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen />}</DialogContent></Dialog>;
}

export function MerchPreview({ full = false }: { full?: boolean }) {
  if (!band.preview && !band.shopify) return null;
  if (band.shopify) return <div className="merch-banner"><h3>Djentries merch.</h3><p>Fedezd fel a zenekar hivatalos termékeit a shopban.</p><Button asChild variant="outline"><Link to="/shop">Tovább a shopba<ArrowUpRight size={17} /></Link></Button></div>;
  return <div className={`merch-preview ${full ? "merch-full" : ""}`}><div className="merch-art"><img src="/images/shirt.svg" alt="Djentries póló — illusztratív termékterv, nem rendelhető" width="600" height="600" loading="lazy" /><span className="merch-tag">Látványterv / 01</span></div><div className="merch-copy"><Kicker>Vidd magaddal a hangzást</Kicker><h3>A színpadtól<br />az utcáig.</h3><p>A Djentries világa, amit magadon viselhetsz.</p><Placeholder>Termékterv. A végleges kínálat és árak a Shopify-ból érkeznek.</Placeholder>{!full && <Button asChild variant="outline"><Link to="/shop">Tovább a shopba<ArrowUpRight size={17} /></Link></Button>}</div></div>;
}

export function NotAvailable({ children }: { children: ReactNode }) { return <div className="empty-state"><Radio size={28} className="accent" /><h3>Hamarosan itt találod.</h3><p>{children}</p></div>; }
export function BackHome() { return <Button asChild variant="outline"><Link to="/"><ArrowDownLeft size={18} />Vissza a főoldalra</Link></Button>; }
