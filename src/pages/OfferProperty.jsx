import { useEffect, useState } from "react";
import { Building2, CheckCircle2, House, LandPlot, MapPin, Package, Send, Store, Warehouse } from "lucide-react";
import { cityAPI, propertyOfferAPI } from "../services/api";
import { useToast } from "../context/toastContextValue";
import { contactInfo } from "../utils/contactInfo";
import { propertyTypes } from "../utils/propertyDetails";
import TurnstileWidget from "../components/TurnstileWidget";
import PublicHero from "../components/PublicHero";

const categoryIcons = {
  SHTEPI: House, BANESA: Building2, TOKA: LandPlot, LOKALE: Store,
  ZYRE: Building2, DEPO: Warehouse, OBJEKT: Building2, VILLE: House, INVENTAR: Package,
};
const categories = Object.entries(propertyTypes).map(([value, label]) => ({ value, label, icon: categoryIcons[value] }));

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  listingType: "Për shitje",
  category: "",
  location: "",
  area: "",
  price: "",
  description: "",
};

const fieldClass = "w-full rounded-xl border border-[#d8e2dc] bg-white px-4 py-3 text-sm text-[#173e34] outline-none transition-colors placeholder:text-gray-400 focus:border-[#b89b56] focus:ring-3 focus:ring-[#EFD391]/25";

export default function OfferProperty() {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [cities, setCities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    let active = true;
    cityAPI.getAll()
      .then(({ data }) => { if (active && Array.isArray(data)) setCities(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (sent) setSent(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.category) {
      toast.error("Zgjidhni kategorinë e pronës.");
      return;
    }
    if (!turnstileToken) {
      toast.error("Ju lutemi përfundoni verifikimin para dërgimit.");
      return;
    }
    setSubmitting(true);
    try {
      await propertyOfferAPI.submit({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        location: form.location.trim(),
        area: Number(form.area),
        price: Number(form.price),
        description: form.description.trim(),
        turnstileToken,
        website,
      });
      setForm(initialForm);
      setSent(true);
      toast.success("Oferta u dërgua me sukses. Do t'ju kontaktojmë së shpejti.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Oferta nuk u dërgua. Ju lutemi provoni përsëri.");
    } finally {
      setSubmitting(false);
      setTurnstileToken("");
      setChallengeVersion((version) => version + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-[#173e34]">
      <PublicHero eyebrow="Ari Real Estate" title="Ofro pronën tënde" description="Na dërgoni të dhënat e pronës dhe ekipi ynë do t'ju ndihmojë të gjeni blerësin ose qiramarrësin e duhur." />

      <section className="relative mx-auto -mt-12 max-w-3xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-[#e4e9e3] bg-white p-5 shadow-[0_22px_60px_rgba(15,70,56,0.12)] sm:p-9">
          <div className="mb-8 border-b border-[#e9eee9] pb-6">
            <h2 className="text-xl font-bold">Të dhënat e pronës</h2>
            <p className="mt-1 text-sm text-gray-500">Plotësoni fushat më poshtë dhe ne do t'ju kontaktojmë.</p>
          </div>

          {sent && (
            <div role="status" className="mb-7 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <CheckCircle2 className="shrink-0" size={20} />
              Oferta juaj u pranua. Ekipi i Ari Real Estate do t'ju kontaktojë së shpejti.
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Emri <span className="text-[#a98836]">*</span>
                <input className={`${fieldClass} mt-2`} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Shkruani emrin tuaj" autoComplete="given-name" maxLength={80} required />
              </label>
              <label className="block text-sm font-semibold">Mbiemri <span className="text-[#a98836]">*</span>
                <input className={`${fieldClass} mt-2`} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Shkruani mbiemrin tuaj" autoComplete="family-name" maxLength={80} required />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Telefoni <span className="text-[#a98836]">*</span>
                <input className={`${fieldClass} mt-2`} type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+383 44 123 456" autoComplete="tel" minLength={8} maxLength={30} required />
              </label>
              <label className="block text-sm font-semibold">Emaili <span className="text-xs font-normal text-gray-400">(opsional)</span>
                <input className={`${fieldClass} mt-2`} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@shembull.com" autoComplete="email" maxLength={160} />
              </label>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold">Lloji i ofertës <span className="text-[#a98836]">*</span></legend>
              <div className="grid grid-cols-2 gap-3">
                {["Për shitje", "Për qira"].map((type) => (
                  <label key={type} className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors ${form.listingType === type ? "border-[#0F4638] bg-[#0F4638] text-white" : "border-[#d8e2dc] bg-white hover:border-[#b89b56]"}`}>
                    <input type="radio" name="listingType" value={type} checked={form.listingType === type} onChange={() => update("listingType", type)} className="sr-only" />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold">Kategoria <span className="text-[#a98836]">*</span></legend>
              <div className="flex flex-wrap gap-2">
                {categories.map(({ value, label, icon: Icon }) => (
                  <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors ${form.category === value ? "border-[#b89b56] bg-[#EFD391]/25 text-[#0F4638]" : "border-[#d8e2dc] hover:border-[#b89b56]"}`}>
                    <input type="radio" name="category" value={value} checked={form.category === value} onChange={() => update("category", value)} className="sr-only" />
                    <Icon size={17} /> {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Lokacioni <span className="text-[#a98836]">*</span>
                <span className="relative mt-2 block">
                  <MapPin size={17} className="pointer-events-none absolute left-3 top-3.5 text-[#b89b56]" />
                  <input className={`${fieldClass} pl-10`} list="offer-cities" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Qyteti, lagja ose fshati" maxLength={160} required />
                  <datalist id="offer-cities">{cities.map((city) => <option key={city} value={city} />)}</datalist>
                </span>
              </label>
              <label className="block text-sm font-semibold">Sipërfaqja (m²) <span className="text-[#a98836]">*</span>
                <input className={`${fieldClass} mt-2`} type="number" min="1" max="10000000" step="any" value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="Shkruani sipërfaqen" required />
              </label>
            </div>

            <label className="block text-sm font-semibold">Çmimi i kërkuar (€) <span className="text-[#a98836]">*</span>
              <input className={`${fieldClass} mt-2`} type="number" min="1" max="1000000000" step="any" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Shkruani çmimin" required />
            </label>

            <label className="block text-sm font-semibold">Përshkrimi <span className="text-xs font-normal text-gray-400">(opsional)</span>
              <textarea className={`${fieldClass} mt-2 min-h-28 resize-y`} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Na tregoni disa hollësi për pronën, adresën ose veçoritë e saj" maxLength={2000} />
            </label>

            <div className="border-t border-[#e9eee9] pt-6">
              <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
              <div className="mb-5"><TurnstileWidget action="property_offer" onToken={setTurnstileToken} resetKey={challengeVersion} /></div>
              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F4638] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#17604d] disabled:cursor-wait disabled:opacity-60">
                <Send size={17} /> {submitting ? "Duke dërguar..." : "Dërgo ofertën"}
              </button>
              <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">Të dhënat tuaja përdoren vetëm për t'ju kontaktuar lidhur me pronën. Për ndihmë, na telefononi në <a className="font-semibold text-[#0F4638] underline" href={contactInfo.phoneHref}>{contactInfo.phone}</a>.</p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
