import { CalendarDays } from "lucide-react";
import { PageHeading, Booking } from "../components/site";
import { Events } from "../components/events";
import { pageMeta } from "../lib/meta";
export const meta = () => pageMeta("Koncertek", "Djentries koncertdátumok, helyszínek és jegyek a Bandsintownról.", "/koncertek");
export default function Shows() { return <><PageHeading number="02" label="Élőben az igazi" title="Színpad. Fény. Zaj" text="A következő koncertig csak felvételek. Utána közös emlékek." /><section className="wrap section pt-0"><div className="list-label"><CalendarDays size={16} />KÖZELGŐ KONCERTEK<span>BANDSINTOWN</span></div><Events /><p className="small muted mt-6">A jegyek és RSVP lehetőségek a koncerthez tartozó külső oldalon nyílnak meg.</p></section><Booking compact /></>; }
