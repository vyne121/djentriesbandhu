import { CalendarDays } from "lucide-react";
import { PageHeading, Booking } from "../components/site";
import { Events } from "../components/events";
import { pageMeta } from "../lib/meta";
export const meta = () => pageMeta("Koncertek", "Djentries koncertdátumok, helyszínek és jegyek a Bandsintownról.", "/koncertek");
export default function Shows() { return <><PageHeading number="02" label="Élőben az igazi" title="Találkozz velünk élőben is!" /><section className="wrap section pt-0"><div className="list-label"><CalendarDays size={16} />KÖZELGŐ KONCERTEK<span>BANDSINTOWN</span></div><Events /><p className="small muted mt-6">Jegyek és részletek az esemény oldalán.</p></section><Booking compact /></>; }
