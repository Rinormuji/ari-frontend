import React from "react";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { contactInfo } from "../utils/contactInfo";

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
    value: contactInfo.phone,
    href: contactInfo.phoneHref,
  },
  {
    icon: MapPin,
    title: "Adresa",
    value: contactInfo.address,
    href: contactInfo.addressHref,
  },
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-[#0F4638] px-6 py-20 text-center text-white">
        <span className="text-sm font-semibold uppercase tracking-widest text-[#EFD391]">Kontakti</span>
        <h1 className="mb-3 mt-3 text-4xl font-bold">Na Gjeni Këtu</h1>
        <p className="mx-auto max-w-xl text-base text-gray-400">
          Na kontaktoni për çdo informacion shtesë rreth pronave apo shërbimeve tona.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title, value, href }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:border-[#EFD391]/30 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFD391]/10">
                <Icon size={20} className="text-[#EFD391]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="break-words text-sm text-gray-500 transition-colors group-hover:text-[#A98836]">{value}</p>
            </a>
          ))}
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
