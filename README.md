# Djentries
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

## Integration checks

Development stays local. Do not publish without a separate request.

Browser tests intercept FormSubmit, Spotify and Shopify requests. The Shopify
fixture checks our component wiring, including variants, availability and cart
actions; it does not verify Shopify's live inventory or payment handling.

Before launch, activate the FormSubmit recipient and confirm receipt of a real
test message. Configure the real Shopify store and verify variants, sold-out
items, quantity changes and a Shopify test checkout. No live payment is needed.
