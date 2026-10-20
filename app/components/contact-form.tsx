import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Send } from "lucide-react";
import { band } from "../content";
import { Button } from "./ui/button";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error" | `error:${string}`>("idle");
  const busy = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (state === "success" || state.startsWith("error")) status.current?.focus({ preventScroll: true });
  }, [state]);
  const recipient = band.booking.formEmail;
  if (!recipient) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const email = String(values.get("email") ?? "").trim();
    const subject = String(values.get("subject") ?? "").trim();
    const message = String(values.get("message") ?? "").trim();
    if (!name || !email || !subject || !message) { setState("error:Töltsd ki a nevet, az e-mail-címet, a tárgyat és az üzenetet."); return; }
    busy.current = true;
    setState("sending");
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient!)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, subject, message, _replyto: email,
          _subject: `Djentries kapcsolat: ${subject}`, _template: "table",
          _honey: String(values.get("_honey") ?? ""), _url: window.location.href.split("#")[0] }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || (result?.success !== true && result?.success !== "true")) {
        const detail = typeof result?.message === "string" ? result.message.trim().slice(0, 500) : "";
        setState(`error:${detail || `A küldőszolgáltatás elutasította a kérést (HTTP ${response.status}).`}`);
        return;
      }
      form.reset();
      setState("success");
    } catch {
      setState("error");
    } finally { busy.current = false; }
  }

  return <form className="contact-form" aria-label="Kapcsolatfelvételi űrlap" method="post" onSubmit={submit}>
    <h3>Írj nekünk!</h3>
    <fieldset disabled={!ready || state === "sending"}>
      <div className="contact-fields">
        <label>Név<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>E-mail-cím<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      </div>
      <label>Tárgy<input name="subject" required maxLength={160} /></label>
      <label>Üzenet<textarea name="message" rows={5} required maxLength={8000} /></label>
      <div className="contact-honeypot" aria-hidden="true"><label>Hagyd üresen<input name="_honey" tabIndex={-1} autoComplete="off" /></label></div>
      <p className="contact-notice">Az üzenetet a FormSubmit továbbítja a zenekarnak. <Link to="/adatvedelem">Adatkezelési tájékoztató</Link></p>
      <Button type="submit" disabled={!ready}><Send size={16} />{state === "sending" ? "Küldés folyamatban…" : "Üzenet küldése"}</Button>
    </fieldset>
    <p ref={status} tabIndex={-1} className="contact-status" role="status" aria-live="polite" aria-atomic="true">
      {state === "success" ? "Köszönjük! Az üzenetedet a küldőszolgáltatás fogadta." : state === "error" ? "Nem kaptunk választ a küldőszolgáltatástól. Az üzeneted megmaradt. Próbáld újra később, vagy írj közvetlenül e-mailt." : state.startsWith("error:") ? (/activat|actived|confirm.{0,60}email/i.test(state.slice(6)) ? "A fogadó e-mail-címet még aktiválni kell. Keresd a FormSubmit aktiváló levelét a djentriesband+szervezes@gmail.com postafiókban, a spam mappában is. A kitöltött üzenet megmaradt." : "A küldés nem sikerült. Az üzeneted megmaradt. Ellenőrizd a mezőket, vagy írj közvetlenül e-mailt.") : state === "sending" ? "Az üzenet küldése folyamatban." : ""}
    </p>
    {state.startsWith("error:") && <p className="small contact-provider-error">Szolgáltatói válasz: {state.slice(6)}</p>}
  </form>;
}
