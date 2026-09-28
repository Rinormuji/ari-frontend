import { useEffect, useState } from "react";
import { CheckCircle2, Facebook, Instagram, Mail, MapPin, Phone, Search, Send } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { contactInfo } from "../utils/contactInfo";
import { propertyTypes } from "../utils/propertyDetails";
import { cityAPI, propertySearchRequestAPI } from "../services/api";
import { useToast } from "../context/toastContextValue";
import TurnstileWidget from "../components/TurnstileWidget";
import PublicHero from "../components/PublicHero";

const initialRequest = {
  name: "", email: "", phone: "", purpose: "FOR_SALE", category: "",
  location: "", maxBudget: "", description: "",
};
const inputClass = "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#173e34] outline-none transition-colors placeholder:text-gray-400 focus:border-[#b89b56] focus:ring-3 focus:ring-[#EFD391]/25";

const cards = [
  {
    icon: Mail,
    title: "Email",
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
  },
  {
    icon: Phone,
    title: "Telefoni",
    links: contactInfo.phones,
  },
  {
    icon: MapPin,
    title: "Adresa",
    value: contactInfo.address,
    href: contactInfo.addressHref,
  },
];

const Contact = () => {
  const toast = useToast();
  const [request, setRequest] = useState(initialRequest);
  const [cities, setCities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    let active = true;
    cityAPI.getAll().then(({ data }) => {
      if (active && Array.isArray(data)) setCities(data);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const update = (field, value) => {
    setRequest((current) => ({ ...current, [field]: value }));
    if (sent) setSent(false);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!request.category) {
      toast.error("Zgjidhni kategorinë e pronës.");
      return;
    }
    if (!turnstileToken) {
      toast.error("Ju lutemi përfundoni verifikimin para dërgimit.");
      return;
    }
    setSubmitting(true);
    try {
      await propertySearchRequestAPI.submit({
        ...request,
        name: request.name.trim(),
        email: request.email.trim(),
        phone: request.phone.trim(),
        location: request.location.trim(),
        maxBudget: request.maxBudget ? Number(request.maxBudget) : null,
        description: request.description.trim(),
        turnstileToken,
        website,
      });
      setRequest(initialRequest);
      setSent(true);
      toast.success("Kërkesa u dërgua me sukses. Do t'ju kontaktojmë së shpejti.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Kërkesa nuk u dërgua. Ju lutemi provoni përsëri.");
    } finally {
      setSubmitting(false);
      setTurnstileToken("");
      setChallengeVersion((version) => version + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <PublicHero eyebrow="Kontakti" title="Na Gjeni Këtu" description="Na kontaktoni për çdo informacion shtesë rreth pronave apo shërbimeve tona." />

      <section className="relative mx-auto -mt-12 max-w-4xl px-6 pb-16">
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, value, href, links }) => (
            <div
              key={title}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:border-[#EFD391]/30 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFD391]/10">
                <Icon size={20} className="text-[#EFD391]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              {(links ?? [{ value, href }]).map((link) => (
                <div key={link.href} className="flex flex-col items-center">
                  {link.label && <span className="text-xs font-semibold text-[#0F4638]">{link.label}</span>}
                  <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="break-words text-sm text-gray-500 transition-colors hover:text-[#A98836]">{link.value}</a>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mb-10 rounded-2xl border border-[#EFD391]/40 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[#0F4638]">{contactInfo.name}</h2>
          <p className="mt-1 text-sm font-semibold tracking-wide text-[#A98836]">{contactInfo.role}</p>
        </div>

        <div className="mb-10 overflow-hidden rounded-3xl border border-[#e4e9e3] bg-white shadow-[0_18px_50px_rgba(15,70,56,0.08)]">
          <div className="bg-[#0F4638] px-6 py-7 text-white sm:px-9">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#EFD391]"><Search size={16} /> Kërkesë për pronë</span>
            <h2 className="mt-2 text-2xl font-bold">Po kërkoni një pronë specifike?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">Na tregoni çfarë kërkoni. Kërkesa juaj i shkon drejtpërdrejt ekipit tonë dhe ne do t'ju kontaktojmë.</p>
          </div>
          <div className="p-6 sm:p-9">
            {sent && <div role="status" className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><CheckCircle2 size={20} className="shrink-0" /> Kërkesa juaj u pranua. Do t'ju kontaktojmë së shpejti.</div>}
            <form onSubmit={submitRequest} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#173e34]">Emri dhe mbiemri *<input className={inputClass} value={request.name} onChange={(e) => update("name", e.target.value)} placeholder="Emri juaj i plotë" autoComplete="name" maxLength={120} required /></label>
                <label className="text-sm font-semibold text-[#173e34]">Emaili *<input className={inputClass} type="email" value={request.email} onChange={(e) => update("email", e.target.value)} placeholder="email@shembull.com" autoComplete="email" maxLength={160} required /></label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#173e34]">Telefoni <span className="font-normal text-gray-400">(opsional)</span><input className={inputClass} type="tel" value={request.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+383 44 123 456" autoComplete="tel" maxLength={30} /></label>
                <label className="text-sm font-semibold text-[#173e34]">Qëllimi *<select className={inputClass} value={request.purpose} onChange={(e) => update("purpose", e.target.value)}><option value="FOR_SALE">Dua të blej</option><option value="FOR_RENT">Dua të marr me qira</option></select></label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#173e34]">Kategoria *<select className={inputClass} value={request.category} onChange={(e) => update("category", e.target.value)} required><option value="">Zgjidhni kategorinë</option>{Object.entries(propertyTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="text-sm font-semibold text-[#173e34]">Lokacioni *<input className={inputClass} list="request-cities" value={request.location} onChange={(e) => update("location", e.target.value)} placeholder="Qyteti ose zona e preferuar" maxLength={160} required /><datalist id="request-cities">{cities.map((city) => <option key={city} value={city} />)}</datalist></label>
              </div>
              <label className="block text-sm font-semibold text-[#173e34]">Buxheti maksimal (€) <span className="font-normal text-gray-400">(opsional)</span><input className={inputClass} type="number" min="1" max="1000000000" step="any" value={request.maxBudget} onChange={(e) => update("maxBudget", e.target.value)} placeholder="Sa dëshironi të shpenzoni?" /></label>
              <label className="block text-sm font-semibold text-[#173e34]">Çfarë prone kërkoni? *<textarea className={`${inputClass} min-h-32 resize-y`} value={request.description} onChange={(e) => update("description", e.target.value)} placeholder="Përshkruani pronën, madhësinë, zonën dhe kërkesat tuaja të veçanta" minLength={15} maxLength={1500} required /></label>
              <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
              <TurnstileWidget action="property_search" onToken={setTurnstileToken} resetKey={challengeVersion} />
              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F4638] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#17604d] disabled:cursor-wait disabled:opacity-60"><Send size={17} /> {submitting ? "Duke dërguar..." : "Dërgo kërkesën"}</button>
              <p className="text-center text-xs leading-relaxed text-gray-500">Të dhënat tuaja përdoren vetëm për t'ju kontaktuar lidhur me kërkesën.</p>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h3 className="mb-2 font-semibold text-gray-900">Rrjetet Sociale</h3>
          <p className="mb-6 text-sm text-gray-500">Na ndiqni për lajmet më të fundit</p>
          <div className="flex items-center justify-center gap-5">
            <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-all hover:border-[#EFD391]/30 hover:bg-[#EFD391]/10 hover:text-[#EFD391]">
              <Facebook size={20} />
            </a>
            <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-all hover:border-[#EFD391]/30 hover:bg-[#EFD391]/10 hover:text-[#EFD391]">
              <Instagram size={20} />
            </a>
            <a href={contactInfo.tiktok} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-all hover:border-[#EFD391]/30 hover:bg-[#EFD391]/10 hover:text-[#EFD391]" aria-label="TikTok">
              <SiTiktok size={19} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
