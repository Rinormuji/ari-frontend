import { CalendarCheck, MapPin, Search, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import PublicHero from "../components/PublicHero";
import { paths } from "../routes/paths";

const features = [
  { icon: Search, title: "Kërkim i Avancuar", text: "Filtrim sipas kategorisë, zonës, statusit dhe preferencave, në një UI modern dhe të lehtë për përdorim." },
  { icon: MapPin, title: "Hartë Interaktive", text: "Shiko pronat në hartë dhe gjej opsionin më të afërt për nevojat e tua." },
  { icon: CalendarCheck, title: "Rezervim Takimesh", text: "Rezervo takime që aprovohen nga agjentët tanë — shpejt dhe lehtë." },
  { icon: Zap, title: "Teknologji Moderne", text: "Platforma ndërtuar me teknologjitë më të fundit për reklamimin e pronave." },
];

export default function AboutAri() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] text-[#173e34]">
      <PublicHero
        eyebrow="Rreth Nesh"
        title="Ari Real Estate"
        description="Një platformë moderne për menaxhimin, shitjen dhe dhënien me qera të pronave me teknologjitë më të fundit."
      >
        <Link to={paths.propertiesMap} className="inline-flex items-center justify-center rounded-xl bg-[#EFD391] px-6 py-3 text-sm font-semibold text-[#173e34] transition-colors hover:bg-[#D9BF7B]">
          Shiko Pronat
        </Link>
      </PublicHero>

      <section className="relative z-10 mx-auto -mt-8 max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#e4e9e3] bg-white shadow-[0_22px_60px_rgba(15,70,56,0.1)]">
          <div aria-hidden="true" className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full border border-[#EFD391]/40" />
          <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:gap-8 sm:p-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#EFD391]/50 bg-[#EFD391]/20 text-[#0F4638] sm:h-20 sm:w-20">
              <Target size={32} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Misioni Ynë</h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Synojmë të krijojmë një rrjet të gjerë, të shpejtë dhe të sigurt ku përdoruesit mund të gjejnë pronën ideale të ëndrrave me besim dhe transparencë.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-18 sm:px-6">
        <div className="mb-10 text-center">
          <div aria-hidden="true" className="mx-auto mb-5 h-1 w-12 rounded-full bg-[#EFD391]" />
          <h2 className="text-2xl font-bold sm:text-3xl">Çfarë Ofrojmë</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-[#e4e9e3] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#EFD391]/70 hover:shadow-[0_14px_35px_rgba(15,70,56,0.09)]">
              <div aria-hidden="true" className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-[#0F4638] to-[#EFD391]" />
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFD391]/20 text-[#0F4638] transition-colors group-hover:bg-[#0F4638] group-hover:text-[#EFD391]">
                <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
