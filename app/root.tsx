import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation, isRouteErrorResponse } from "react-router";
import { ArrowUpRight, Menu, Music2 } from "lucide-react";
import { band, brandAssets, navigation, pageAvailable } from "./content";
import { PlayerProvider } from "./components/player";
import { SocialLinks, BackHome } from "./components/site";
import { Button } from "./components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import "@fontsource/barlow-condensed/latin-ext-600.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-ext-700.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-900-italic.css";
import "@fontsource/source-sans-3/latin-ext-400.css";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-ext-600.css";
import "@fontsource/source-sans-3/latin-600.css";
import "./styles.css";

export const meta = () => [{ title: "Djentries - Modern metalcore / rock" }, { name: "description", content: "Djentries. Modern metalcore / rock. Zenék, koncertek, sajtóanyag és booking egy helyen." }];
export function Layout({ children }: { children: ReactNode }) {
  return <html lang="hu"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#071c18" /><meta name="robots" content={band.preview ? "noindex, nofollow" : "index, follow"} /><meta property="og:site_name" content="Djentries" /><meta property="og:type" content="website" /><meta property="og:image" content={`${band.siteUrl}/images/social.png`} /><link rel="icon" href="/favicon.svg" type="image/svg+xml" /><Meta /><Links /></head><body>{children}<ScrollRestoration /><Scripts /></body></html>;
}
function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  return <><a className="skip-link" href="#main">Ugrás a tartalomra</a>{band.preview && <div className="preview-banner"><span className="status-dot" />PRIVÁT ELŐNÉZET <span>- Arculati előnézet · a szövegezés még készül.</span><Link to="/epk#anyagok">Mi kerül ide?<ArrowUpRight size={12} /></Link></div>}<header className="site-header"><div className="wrap header-inner"><Link to="/" className="wordmark" aria-label="Djentries főoldal"><img src={brandAssets.wordmark} alt="Djentries" width="1400" height="552" /></Link><nav className="desktop-nav" aria-label="Fő navigáció">{navigation.filter(n => pageAvailable(n.href)).map(n => <NavLink key={n.href} to={n.href}>{n.label}</NavLink>)}</nav><Link className="header-booking" to="/#kapcsolat">Booking<ArrowUpRight size={16} /></Link><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="icon" variant="ghost" className="mobile-menu" aria-label="Menü megnyitása"><Menu /></Button></DialogTrigger><DialogContent><DialogTitle className="dialog-title"><img className="menu-wordmark" src={brandAssets.wordmark} alt="Djentries" width="1400" height="552" /></DialogTitle><DialogDescription>Fedezd fel a zenekart.</DialogDescription><nav className="mobile-nav" aria-label="Mobil navigáció">{[{ href: "/", label: "Főoldal" }, ...navigation].filter(n => pageAvailable(n.href)).map(n => <DialogClose asChild key={n.href}><NavLink to={n.href}>{n.label}<ArrowUpRight size={22} /></NavLink></DialogClose>)}</nav></DialogContent></Dialog></div></header></>;
}
function Footer() {
  return <footer className="site-footer"><div className="wrap"><div className="footer-top"><div className="footer-identity"><img className="footer-mascot" src={brandAssets.mascot} alt="A Djentries pulyka kabalafigurája" width="800" height="800" loading="lazy" /><Link to="/" className="footer-wordmark"><img src={brandAssets.wordmark} alt="Djentries" width="1400" height="552" loading="lazy" /></Link></div><div><p className="kicker">Kövess minket!</p><SocialLinks />{band.preview && !band.socials.length && <p className="small muted">A hivatalos közösségi linkek hamarosan.</p>}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Djentries · {band.genre}</span><div>{pageAvailable("/adatvedelem") && <Link to="/adatvedelem">Adatvédelem</Link>}<a href="#top">Vissza az elejére ↑</a></div></div></div></footer>;
}
function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => { document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true }); }, [pathname]);
  return null;
}
export default function App() {
  const { pathname } = useLocation();
  return <PlayerProvider><div id="top"><Header /><main id="main" tabIndex={-1}>{(!["/zene", "/koncertek", "/epk", "/shop", "/adatvedelem"].includes(pathname) || pageAvailable(pathname)) ? <Outlet /> : <div className="wrap page-heading"><h1>Ez az oldal még készül.</h1><p>A végleges tartalom feltöltése után lesz elérhető.</p><BackHome /></div>}</main><Footer /><RouteFocus /></div></PlayerProvider>;
}
export function ErrorBoundary({ error }: { error: unknown }) {
  return <div className="wrap page-heading"><Music2 className="accent" /><h1>{isRouteErrorResponse(error) && error.status === 404 ? "Ez a szám kimaradt." : "Megakadt a lejátszás."}</h1><p>Az oldal most nem érhető el. Próbáld újra a főoldalról.</p><BackHome /></div>;
}
