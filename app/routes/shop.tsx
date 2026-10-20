import { band } from "../content";
import { MerchPreview, PageHeading } from "../components/site";
import { Shopify } from "../components/shopify";
import { pageMeta } from "../lib/meta";
export const meta = () => pageMeta("Shop", "Djentries merchandise. Hivatalos termékek a zenekar Shopify-áruházából.", "/shop");
export default function Shop() { return <><PageHeading number="04" label="Djentries merch" title="A Djentries a hétköznapokban is veled marad" text="A koncert véget ér, de a Djentries életérzés hazakísér." /><section className="wrap section pt-0">{!band.shopify && <MerchPreview full />}<Shopify /></section></>; }
