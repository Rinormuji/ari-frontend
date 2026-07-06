import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { Link } from "react-router-dom";
import logoMark from "../assets/images/ari-mark.svg";
import { paths } from "../routes/paths";
import { contactInfo } from "../utils/contactInfo";
import BackToTopButton from "./BackToTopButton";

export default function Footer() {
  const links = [
    { label: "Ballina", to: paths.home },
    { label: "Kërko Prona", to: paths.properties },
    { label: "Harta", to: paths.propertiesMap },
    { label: "Rreth Nesh", to: paths.about },
    { label: "Kontakti", to: paths.contact },
  ];

  return (
    <footer className="border-t border-[#EFD391]/20 bg-[#0F4638] text-[#E8E1D2]/75">
      <BackToTopButton />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <Link to={paths.home} className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#0B3F35]">
            <img src={logoMark} alt="Ari Real Estate" className="h-11 w-11" />
          </Link>
          <p className="text-sm leading-relaxed text-[#E8E1D2]/60">
            Platforma juaj për gjetjen e pronës ideale në Kosovë.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#EFD391]">Navigimi</h4>
          {links.map(({ label, to }) => (
            <Link key={to} to={to} className="text-sm transition-colors hover:text-[#EFD391]">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#EFD391]">Kontakti</h4>
          <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 break-words text-sm transition-colors hover:text-[#EFD391]">
            <Mail size={14} /> {contactInfo.email}
          </a>
          <a href={contactInfo.phoneHref} className="flex items-center gap-2 text-sm transition-colors hover:text-[#EFD391]">
            <Phone size={14} /> {contactInfo.phone}
          </a>
          <a href={contactInfo.addressHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm transition-colors hover:text-[#EFD391]">
            <MapPin size={14} /> {contactInfo.address}
          </a>

          <div className="mt-2 flex items-center gap-4">
            <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-[#E8E1D2]/70 transition-colors hover:text-[#EFD391]" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="text-[#E8E1D2]/70 transition-colors hover:text-[#EFD391]" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href={contactInfo.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#E8E1D2]/70 transition-colors hover:text-[#EFD391]" aria-label="TikTok">
              <SiTiktok size={19} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#EFD391]/20 py-5 text-center text-xs text-[#E8E1D2]/50">
        © {new Date().getFullYear()} Ari Real Estate. All rights reserved.
      </div>
    </footer>
  );
}
