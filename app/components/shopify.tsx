import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { band, type ShopifyConfig } from "../content";
import { Button } from "./ui/button";
import { safeExternalUrl } from "../lib/utils";

const escape = (text: string) => text.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
type CartElement = HTMLElement & { addLine: (event: Event) => CartElement; showModal: () => void };
export function validShop(config: ShopifyConfig) { return /^https:\/\/[a-z0-9][a-z0-9-]*\.myshopify\.com\/?$/.test(config.domain) && config.productHandles.length > 0 && config.productHandles.every(h => /^[a-z0-9][a-z0-9-]*$/.test(h)); }

function Store({ config }: { config: ShopifyConfig }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    const el = host.current!;
    let disposed = false;
    let timeout: ReturnType<typeof setTimeout>;
    let script: HTMLScriptElement | null = null;
    if (!validShop(config)) { setState("error"); return; }
    const render = () => {
      if (disposed) return;
      el.innerHTML = `<shopify-store store-domain="${escape(config.domain)}" public-access-token="${escape(config.publicAccessToken)}" country="${escape(config.country)}" language="${escape(config.language)}"></shopify-store><button class="button button-outline" data-cart-open>Kosár megnyitása</button><div class="shop-products">${config.productHandles.map(handle => `<shopify-context type="product" handle="${escape(handle)}"><template><article class="shop-product"><shopify-media query="product.selectedOrFirstAvailableVariant.image" width="600" height="600"></shopify-media><h2><shopify-data query="product.title"></shopify-data></h2><p><shopify-data query="product.description"></shopify-data></p><shopify-money query="product.selectedOrFirstAvailableVariant.price"></shopify-money><shopify-variant-selector></shopify-variant-selector><button class="button button-primary" data-cart-add shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"><span shopify-attr--hidden="!product.selectedOrFirstAvailableVariant.availableForSale">Kosárba</span><span shopify-attr--hidden="product.selectedOrFirstAvailableVariant.availableForSale">Elfogyott</span></button></article></template><p shopify-loading-placeholder>Termék betöltése…</p></shopify-context>`).join("")}</div><shopify-cart id="djentries-cart"><span slot="header">Kosár</span><span slot="checkout-button">Tovább a fizetéshez</span><span slot="empty">A kosarad még üres.</span></shopify-cart>`;
      timeout = setTimeout(() => setState("error"), 20000);
    };
    function dataLoaded(event: Event) {
      const { errors } = (event as CustomEvent).detail ?? {};
      if (errors) { setState("error"); clearTimeout(timeout); }
    }
    function rendered() {
      const products = el.querySelectorAll(".shop-product");
      if (products.length === config.productHandles.length && products.length) { setState("ready"); clearTimeout(timeout); }
    }
    function click(event: Event) {
      const target = event.target as Element;
      const cart = el.querySelector<CartElement>("shopify-cart");
      if (!cart) return;
      try {
        if (target.closest("[data-cart-add]")) cart.addLine(event).showModal();
        if (target.closest("[data-cart-open]")) cart.showModal();
      } catch { setState("error"); }
    }
    el.addEventListener("shopify-render", rendered);
    el.addEventListener("data-loaded", dataLoaded, true);
    el.addEventListener("click", click);
    const observer = new MutationObserver(rendered);
    observer.observe(el, { subtree: true, childList: true });
    if (customElements.get("shopify-store")) render();
    else {
      script = document.createElement("script");
      script.src = "https://cdn.shopify.com/storefront/web-components.js";
      script.onload = render;
      script.onerror = () => setState("error");
      document.head.appendChild(script);
    }
    return () => { disposed = true; clearTimeout(timeout); script?.remove(); observer.disconnect(); el.removeEventListener("shopify-render", rendered); el.removeEventListener("data-loaded", dataLoaded, true); el.removeEventListener("click", click); el.replaceChildren(); };
  }, [config]);
  return <><p className="small muted" role="status">{state === "loading" ? "Kínálat betöltése…" : state === "error" ? "A kínálat egy része nem érhető el. Próbáld újra később, vagy nyisd meg a Shopify-áruházat." : "A készletet és az árakat a Shopify szolgáltatja."}</p><div ref={host} />{state === "error" && validShop(config) && <a className="text-link" href={config.domain} target="_blank" rel="noopener noreferrer">Shopify-áruház megnyitása ↗</a>}<p className="small muted mt-6">A fizetés a Shopify biztonságos pénztárában történik.</p><div className="social-links">{config.policies.filter(p => safeExternalUrl(p.url)).map(p => <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer">{p.label} ↗</a>)}</div></>;
}
export function Shopify() {
  const [active, setActive] = useState(false);
  if (!band.shopify) return <div className="shop-pending"><ShoppingBag size={23} /><div><h3>A webshop hamarosan megnyílik!</h3><p>A termékek a Shopify-áruház csatlakoztatása után lesznek rendelhetők.</p></div></div>;
  return active ? <Store config={band.shopify} /> : <div className="activation"><ShoppingBag className="accent" /><div><h3>Djentries merch</h3><p>A kínálat betöltésével kapcsolat létesül a Shopify-jal.</p></div><Button onClick={() => setActive(true)}>Shop betöltése</Button></div>;
}
