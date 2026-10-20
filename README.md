# Djentries

Hungarian band website built with React, React Router, TypeScript, Tailwind CSS and customized shadcn/ui button/dialog components. Public pages are pre-rendered; hosting needs only the generated static files.

Development is currently **local only**, at the user's request. Do not deploy or synchronize source to Sites unless explicitly requested again. The prior hosted preview still needs removal through Sites management; the available tools have no undeploy action. Keep `.openai/hosting.json` as a record of the existing Site identity; it does not trigger deployment.

## Run

Use Node.js 22.18 or newer.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run test:browser
npm run build
```

`dist/client/` is the deployable website. The browser tests use installed Google Chrome on macOS; set `PLAYWRIGHT_CHROME_PATH` for another installation or run `npx playwright install chromium` and leave that variable unset on other platforms. Production hosting must serve directory index files and `404.html` with a 404 status for unknown URLs.

## Replace preview content

All approved facts, account identifiers and files are configured in **`app/content.ts`**. Keep `preview: true` until the band materials are supplied. The preview is marked noindex, blocks indexing in robots.txt, labels mood imagery and exposes unfinished sections for review. No artist accounts, booking email addresses, dates, achievements, quotes or actual products have been fabricated.

1. The supplied wordmark, full-band portrait, live photographs, mascot and cover art are now in `public/images/brand/`. `heroPhoto` and `heroMobilePhoto` use the complete band portrait; `brandAssets` contains the other paths. Colours and the non-destructive photo treatment are in `app/styles.css`. See `BRANDING.md` for the approved visual direction and asset preparation.
2. Supply `shortBio`, `fullBio`, `homeBase`, `lineup`, `setLengths`, `credentials` and attributed `pressQuotes` as available.
3. Set `booking.email`, `booking.phone` and `booking.formEmail` and every official social profile in `socials`. Missing contacts are never replaced with dummy mail links.
4. Add confirmed Spotify HTTPS URLs for `spotifyArtist` and each release; `null` means the release artwork is available but its listening link is still missing. Release URLs must identify an album, track, artist or playlist. Provide release title, kind, artwork path and optional year. The player is activated explicitly, stays mounted across internal navigation and closes on request. Spotify controls playback and account restrictions.
5. Supply a YouTube video ID (11 characters) in `video.youtubeId`. The initial video is a lyric video; set `video.kind` to `music` and replace its title, poster and link when the music video arrives. Videos load in an explicit dialog without autoplay, using youtube-nocookie.com.
6. Configure `bandsintown` with the exact artist identifier from the official widget configuration and its artist-page URL. A scoped iframe loads the official widget only after activation. The widget owns event contents and its empty state; loading errors are reported separately.
7. Place EPK files under `public/press/` and set download `href` values. Use same-origin file paths. Unavailable files stay labelled in preview and disappear from the public EPK.
8. Configure Shopify as below. Product images and prices are supplied by Shopify; the preview shirt is only an illustrative drawing and cannot be purchased.
9. Supply the final `privacyText`, including the operator/contact information and the relevant third-party disclosures. Update `siteUrl` if using a custom domain.
10. Set `preview: false`, rebuild and review privately. Public build checks require a real hero photo, approved bio, booking email and final privacy text. Unconfigured music, concerts, shop and EPK routes disappear from navigation and sitemap; direct visits show an unavailable-page notice. Hosting access is controlled separately: changing preview does not make a private Site public.

## Shopify

Set `shopify` to an object in `app/content.ts`:

```ts
{
  domain: "https://YOUR-STORE.myshopify.com",
  publicAccessToken: "", // Only a PUBLIC Storefront token, if needed. Never an Admin/private token.
  productHandles: ["YOUR-PRODUCT-HANDLE"],
  country: "HU",
  language: "HU",
  policies: [
    { label: "Szállítás és visszaküldés", url: "https://YOUR-STORE.myshopify.com/policies/shipping-policy" },
    { label: "Vásárlási feltételek", url: "https://YOUR-STORE.myshopify.com/policies/terms-of-service" }
  ]
}
```

The official Shopify Storefront Web Components render product descriptions, prices, variant selectors, availability and the cart. Checkout uses Shopify's hosted checkout. Publish merchandise to the appropriate sales channel and configure Hungarian language, market, currency, shipping, taxes, policy links and payment methods in Shopify before launch. Verify all variant combinations and complete a Shopify test-mode checkout. No real purchase is part of the automated tests.

## Privacy defaults

Fonts and preview images are hosted locally. No analytics or newsletter scripts are included. Spotify, YouTube, Bandsintown and Shopify connect only on activation. No consent decision is persisted. Reloading removes active embeds; closing the player stops Spotify. External links open only on deliberate navigation.

## Verification

The small unit suite checks URL trust boundaries and public content gating. Browser checks cover all routes at phone, tablet and desktop widths, hydration errors, horizontal overflow, mobile-menu focus, unavailable downloads, no automatic third-party requests, player continuity and provider-script failures. Provider tests use test-only configuration and intercepted responses, not real credentials. Real music playback, event content, inventory, cart mutations and checkout must be checked with the band's accounts.

Preview mood photographs: [concert audience](https://images.unsplash.com/photo-1501386761578-eac5c94b800a) (downloaded via Unsplash image `photo-1501386761578-eac5c94b800a`) and Unsplash image `photo-1498038432885-c6f3f1b912ee` (live performance). These are not presented as photographs of Djentries. SVG record and shirt graphics are illustrative preview artwork.


## Contact form

The shared booking form posts to FormSubmit only when submitted. `booking.formEmail` is the delivery recipient (`djentriesband+szervezes@gmail.com`); `booking.email` is the separately displayed/copied address (`djentriesband@gmail.com`). The phone link uses `booking.phone`.

Before using the form for real inquiries, submit one deliberate activation message from the local preview and confirm the FormSubmit email sent to the delivery recipient. Recheck activation and delivery on the final domain before launch, including the spam folder. No activation or real email is sent by automated tests. Without provider confirmation, submissions may be held by FormSubmit. The form reports only a successful provider acknowledgment, not inbox delivery. Errors preserve all fields; an uncertain/timed-out request is never retried automatically. Honeypot and provider spam filtering remain enabled; the form does not disable CAPTCHA settings.

Update and approve the supplied privacy policy for the contact form and FormSubmit before public launch. A brief factual integration notice is included in the preview. Tests intercept all submission requests; real delivery and provider activation remain manual checks.
