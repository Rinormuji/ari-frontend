import React from "react";
import { Search, MapPin, CalendarCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Search, title: "Kërkim i Avancuar", text: "Filtrim sipas kategorisë, zonës, statusit dhe preferencave, në një UI modern dhe të lehtë për përdorim." },
  { icon: MapPin, title: "Hartë Interaktive", text: "Shiko pronat në hartë dhe gjej opsionin më të afërt për nevojat e tua." },
  { icon: CalendarCheck, title: "Rezervim Takimesh", text: "Rezervo takime që aprovohen nga agjentët tanë — shpejt dhe lehtë." },
  { icon: Zap, title: "Teknologji Moderne", text: "Platforma ndërtuar me teknologjitë më të fundit për reklamimin e pronave." },
];

const AboutAri = () => {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-black via-gray-900 to-black opacity-90" />
        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
          <span className="inline-block text-[#FFAE42] text-sm font-semibold tracking-widest uppercase mb-4">Rreth Nesh</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">Ari Real Estate</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Një platformë moderne për menaxhimin, shitjen dhe dhënien me qera të pronave me teknologjitë më të fundit.
          </p>
          <Link to="/properties" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#FFAE42] text-black font-semibold rounded-xl hover:bg-[#e09a35] transition-colors text-sm">
            Shiko Pronat
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Misioni Ynë</h2>
        <p className="text-gray-600 leading-relaxed text-base">
          Synojmë të krijojmë një rrjet të gjerë, të shpejtë dhe të sigurt ku përdoruesit mund të gjejnë pronën ideale të ëndrrave me besim dhe transparencë.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Çfarë Ofrojmë</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FFAE42]/10 flex items-center justify-center">
                <Icon size={20} className="text-[#FFAE42]" />
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutAri;
