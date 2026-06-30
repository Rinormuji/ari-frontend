import logo2 from '../assets/images/ari-logo.jpg';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Music, Mail, Phone, MapPin } from 'lucide-react';
import BackToTopButton from './BackToTopButton';

export default function Footer() {
  return (
    <footer className="bg-[#0F4638] border-t border-[#EFD391]/20 text-[#E8E1D2]/75">
      <BackToTopButton />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Logo */}
        <div className="flex flex-col gap-3">
          <img src={logo2} alt="Ari Real Estate" className="h-14 w-auto" />
          <p className="text-sm leading-relaxed text-[#E8E1D2]/60">
            Platforma juaj për gjetjen e pronës ideale në Kosovë.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[#EFD391] font-semibold text-sm uppercase tracking-wider mb-1">Navigimi</h4>
          {[
            { label: "Ballina", to: "/" },
            { label: "Kërko Prona", to: "/properties" },
            { label: "Rreth Nesh", to: "/about" },
            { label: "Kontakti", to: "/contact" },
          ].map(({ label, to }) => (
            <Link key={to} to={to} className="text-sm hover:text-[#EFD391] transition-colors">
              {label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[#EFD391] font-semibold text-sm uppercase tracking-wider mb-1">Kontakti</h4>
          <a href="mailto:info@arirealestate.com" className="flex items-center gap-2 text-sm hover:text-[#EFD391] transition-colors">
            <Mail size={14} /> info@arirealestate.com
          </a>
          <a href="tel:+38345465726" className="flex items-center gap-2 text-sm hover:text-[#EFD391] transition-colors">
            <Phone size={14} /> +383 45 465 726
          </a>
          <a href="https://maps.app.goo.gl/ip4iUs994cqPUgjR6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-[#EFD391] transition-colors">
            <MapPin size={14} /> Gjilan, Kosovë
          </a>

          <div className="flex items-center gap-4 mt-2">
            <a href="https://www.facebook.com/p/Ari-Real-Estate-61554838910212/" target="_blank" rel="noopener noreferrer" className="text-[#E8E1D2]/70 hover:text-[#EFD391] transition-colors">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/ari_realestate.ks/" target="_blank" rel="noopener noreferrer" className="text-[#E8E1D2]/70 hover:text-[#EFD391] transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@ari_realestate1" target="_blank" rel="noopener noreferrer" className="text-[#E8E1D2]/70 hover:text-[#EFD391] transition-colors">
              <Music size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#EFD391]/20 text-center text-xs text-[#E8E1D2]/50 py-5">
        © {new Date().getFullYear()} Ari Real Estate. All rights reserved.
      </div>
    </footer>
  );
}
