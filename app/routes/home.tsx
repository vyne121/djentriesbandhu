import { useState } from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowUpRight, Disc3, Headphones, Pause, Play } from "lucide-react";
import { band, brandAssets, pageAvailable } from "../content";
import { Booking, Kicker, FeaturedVideo, MerchPreview, Placeholder, SectionHeader } from "../components/site";
import { ListenButton } from "../components/player";
import { Button } from "../components/ui/button";
import { Events } from "../components/events";
import { pageMeta } from "../lib/meta";
export const meta = () => pageMeta("Modern metalcore / rock", "Djentries. Zene, koncertdátumok, sajtóanyag és booking. Ismerd meg a zenekart, hallgass bele és találkozz velünk élőben.", "/");

export default function Home() {
  const release = band.releases[0];
  const [bannerPaused, setBannerPaused] = useState(false);
  return <>
    <section className="hero">
      <div className="wrap hero-topline">
        <span className="kicker"><span className="status-dot" />MODERN METALCORE / ROCK</span>
      </div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="hero-title">
            <h1><span className="sr-only">Djentries</span><img src={brandAssets.wordmark} alt="" width="1400" height="552" /></h1>
          </div>
          <p>Dallamos, mégis erős hangzás<br />Érzelmes, de nem érzelgős</p>
          <div className="hero-actions">
            {pageAvailable("/epk") && <Button asChild><Link to="/epk">Koncertszervezőknek<ArrowUpRight size={18} /></Link></Button>}
            <ListenButton label="Hallgass minket!" outline />
          </div>
          <a href="#felfedezes" className="hero-scroll"><ArrowDown size={18} /><span>GÖRGESS LEJJEBB</span></a>
        </div>
        {band.heroPhoto && <div className="hero-media"><picture>
          <source media="(max-width: 767px)" srcSet={band.heroMobilePhoto ?? band.heroPhoto} />
          <img className="hero-image" src={band.heroPhoto} alt="A Djentries négy tagja együtt, zenekari portré" width="1024" height="768" fetchPriority="high" />
        </picture></div>}
      </div>
    </section>
    <div className="manifesto-strip">
      <div className="banner-track" aria-hidden="true" data-paused={bannerPaused}>
        {[0, 1].map(group => <span className="banner-group" key={group}>{"DJENTRIES ".repeat(8)}</span>)}
      </div>
      <button className="banner-toggle" aria-label={bannerPaused ? "Banner mozgásának folytatása" : "Banner mozgásának szüneteltetése"} aria-pressed={bannerPaused} onClick={() => setBannerPaused(paused => !paused)}>
        {bannerPaused ? <Play size={18} /> : <Pause size={18} />}
      </button>
    </div>
    <section className="wrap intro section" id="felfedezes">
      <Kicker number="01">A zenekar</Kicker>
      <div className="intro-grid">
        <h2>Mi vagyunk <span className="text-muted">a Djentries</span></h2>
        <div>{band.shortBio && <p className="lead">{band.shortBio}</p>}
          {pageAvailable("/epk") && <Link className="text-link" to="/epk">Ismerj meg minket<ArrowUpRight size={17} /></Link>}
        </div>
      </div>
      <div className="live-photo-pair" aria-label="Djentries koncertfotók">
        {brandAssets.livePhotos.map(photo => <div className="live-photo" key={photo.src}><img src={photo.src} alt={photo.alt} width="1100" height="1400" loading="lazy" /></div>)}
      </div>
    </section>
    {(band.preview || release || band.spotifyArtist) && <section className="release-section"><div className="wrap section">
      <SectionHeader number="02" label="A hangunk" title="Hallgass bele a zenénkbe!" href="/zene" link="Minden megjelenés" />
      <div className="release-grid"><div className="record-art">
        <img src={release?.artwork ?? "/images/record.svg"} alt={release ? `${release.title} lemezborító` : "Lemezborító látványterv"} width="1000" height="1000" loading="lazy" />
        <span className="record-stamp"><Disc3 size={20} />{release ? release.kind : "ARTWORK PREVIEW"}</span>
      </div><div className="release-copy">
        <Kicker><Headphones size={15} />{release?.kind ?? "Zene / Djentries"}</Kicker>
        <h2>{release?.title ?? <>A csendnek<br />itt vége.</>}</h2>
        <p>Külvilág ki / Zene BE!</p>
        <ListenButton label="Hallgasd meg Spotify-on!" url={release?.spotify ?? null} />
        {!release?.spotify && <Placeholder>A Spotify-link még nincs megadva.</Placeholder>}
      </div></div>
    </div></section>}
    {(band.preview || band.video.youtubeId) && <section className="wrap section">
      <SectionHeader number="03" label={band.video.kind === "lyric" ? "Dalszövegvideó" : band.video.kind === "music" ? "Videóklip" : "Élőben"} title={band.video.title} /><FeaturedVideo />
    </section>}
    {(band.preview || band.bandsintown) && <section className="wrap section shows-section">
      <SectionHeader number="04" label="Koncertek" title="Találkozz velünk élőben is!" href="/koncertek" link="Összes koncert" /><Events compact />
      {band.credentials.length > 0 && <div className="credentials">{band.credentials.map(c => <span key={c}>{c}</span>)}</div>}
    </section>}
    {(band.preview || band.shopify) && <section className="merch-section"><div className="wrap section">
      <SectionHeader number="05" label="Djentries merch" title="Válassz zenekaros termékeink közül és viseld büszkén!" href="/shop" link="Irány a shop" /><MerchPreview />
    </div></section>}
    {(band.preview || band.booking.email || band.booking.phone) && <Booking />}
  </>;
}
