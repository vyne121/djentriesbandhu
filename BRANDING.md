# Djentries visual direction

Implemented locally, without publishing or pushing to Sites.

- Deep forest green `#071c18`, lighter forest sections `#0d2721`, aged cream `#e6ddbe`, muted sage `#b9cab1`. Sharp, restrained layouts; no decorative grain overlays.
- Original Djentries blackletter identity in header, hero, mobile menu and footer. Supporting text uses readable Barlow Condensed and Source Sans 3.
- The supplied full-band portrait (photo #2) leads. It retains its complete 4:3 composition at every breakpoint; CSS applies subtle darkening and desaturation without changing the original photo.
- The supplied singer and drummer performance photos appear below the introduction, with the same restrained treatment.
- The turkey mascot appears in the footer and the shirt preview, never in the hero.
- The released **A Szikra** is featured. **Végtelen az éj** appears on the music page. Covers retain their colours. The untitled cover candidate is saved as an asset, not represented as an announced release.
- The video section is labelled **Dalszövegvideó**. Configure `band.video.youtubeId` when the link is supplied; change `kind` to `music` and replace the title/poster/link when the official clip is available. No release date or video link is invented.
- Merch uses the supplied mascot lockup inside the existing SVG shirt preview. It is clearly labelled a preview and is not purchasable.
- Marketing copy remains for the next wording step. Only factual content and functional video labels were updated.

## Assets

Website assets live under `public/images/brand/`. Photos and cover art are optimized WebP copies; supplied files in Photos/iCloud are untouched. Asset paths are in `app/content.ts`.

`wordmark-original.png` preserves the supplied artwork. `wordmark.png` is the transparent version prepared using the built-in Imagegen tool, visually checked at website sizes. The generated variants have not replaced the original file.

Selected extraction prompt:

> Use case: background-extraction. Asset type: existing band wordmark for a website header. Edit target: supplied Djentries wordmark. Remove ONLY the entire rectangular dark green/purple patterned background and the outside white margins. Preserve the exact original cream blackletter wordmark 'Djentries' and its three cream four-point stars, their exact letter shapes, proportions, spacing, cream colour and subtle printed texture. Keep every letter and star intact; do not redesign, retype or stylize them. Leave open counters inside letters transparent too. Actual transparent alpha background everywhere except the lettering and stars, tightly framed landscape wordmark. Do not add shadows, outlines, extra text, icons or a backdrop. Text verbatim: Djentries.

No Shopify, Bandsintown, Spotify or YouTube account settings have been changed. Listening and video controls remain explicitly activated; live provider links are still awaiting confirmation.
