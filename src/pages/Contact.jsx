import React from "react";
import { Mail, Phone, MapPin, Facebook, Instagram, Music } from "lucide-react";

const cards = [
  { icon: Mail, title: "Email", value: "info@arirealestate.com", href: "mailto:info@arirealestate.com" },
  { icon: Phone, title: "Telefoni", value: "+383 48 465 726", href: "tel:+38348465726" },
  { icon: MapPin, title: "Adresa", value: "Gjilan, Kosovë", href: "https://maps.app.goo.gl/ip4iUs994cqPUgjR6" },
];

const Contact = () => {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <section className="bg-black text-white py-20 text-center px-6">
        <span className="text-[#FFAE42] text-sm font-semibold tracking-widest uppercase">Kontakti</span>
        <h1 className="text-4xl font-bold mt-3 mb-3">Na Gjeni Këtu</h1>
        <p className="text-gray-400 max-w-xl mx-auto text-base">Na kontaktoni për çdo informacion shtesë rreth pronave apo shërbimeve tona.</p>
      </section>

      {/* Cards */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {cards.map(({ icon: Icon, title, value, href }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3 text-center hover:shadow-md hover:border-[#FFAE42]/30 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#FFAE42]/10 flex items-center justify-center">
                <Icon size={20} className="text-[#FFAE42]" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
              <p className="text-sm text-gray-500 group-hover:text-[#FFAE42] transition-colors">{value}</p>
            </a>
          ))}
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Rrjetet Sociale</h3>
          <p className="text-sm text-gray-500 mb-6">Na ndiqni për lajmet më të fundit</p>
          <div className="flex justify-center items-center gap-5">
            <a href="https://www.facebook.com/p/Ari-Real-Estate-61554838910212/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FFAE42]/10 hover:text-[#FFAE42] hover:border-[#FFAE42]/30 transition-all">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/ari_realestate.ks/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FFAE42]/10 hover:text-[#FFAE42] hover:border-[#FFAE42]/30 transition-all">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@ari_realestate1" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FFAE42]/10 hover:text-[#FFAE42] hover:border-[#FFAE42]/30 transition-all">
              <Music size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
