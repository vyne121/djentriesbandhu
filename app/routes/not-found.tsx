import { BackHome } from "../components/site";
export const meta = () => [{ title: "404 - Djentries" }];
export default function NotFound() { return <section className="wrap page-heading not-found"><p className="kicker">404 / Rossz frekvencia</p><h1>Ez a szám<br />kimaradt<span className="accent">.</span></h1><p className="lead">Ezen a címen nincs oldal. A főoldalon újra felveheted a ritmust.</p><BackHome /></section>; }
