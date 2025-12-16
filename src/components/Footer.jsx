import { useEffect } from "react";
import logo2 from '../assets/images/logo2.png';
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TikTokIcon from "@mui/icons-material/MusicNote";
import BackToTopButton from "./BackToTopButton";

export default function Footer() {

  // Back to top function
  // const scrollToTop = () => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  // Optional: Scroll animation initialization (AOS library)
  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({ duration: 700, once: true });
    }
  }, []);

  return (
    <footer className="ari-footer-container">

<BackToTopButton />


      {/* SVG Separator */}
      <div className="ari-footer-svg">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#0f1115" d="M0,0 C720,100 720,0 1440,100 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* Footer Main Content */}
      <div className="ari-footer-main" data-aos="fade-up">

        {/* --- About / Logo --- */}
        <div className="ari-footer-block ari-footer-about">
          <img src={logo2} alt="Ari Real Estate" className="ari-footer-logo" />
          {/* <p className="ari-footer-tagline">
            Ne ndihmojmë klientët të gjejnë shtëpinë e ëndrrave — me transparencë dhe eksperiencë.
          </p> */}
        </div>

        {/* --- Navigation Links --- */}
        <div className="ari-footer-block ari-footer-links">
          <h4 className="ari-footer-heading">Shiko edhe</h4>
          <a href="/" className="ari-footer-link">Ballina</a>
          <a href="/properties" className="ari-footer-link">Kërko Prona</a>
          <a href="/about" className="ari-footer-link">Rreth Nesh</a>
          <a href="/contact" className="ari-footer-link">Kontakti</a>
        </div>

        {/* --- Contacts & Social --- */}
        <div className="ari-footer-block ari-footer-contact">
          <h4 className="ari-footer-heading">Kontakti</h4>
          <div className="ari-footer-info">
            <span className="ari-footer-info-title">Email:</span>
            <a href="mailto:info@arirealestate.com" className="ari-footer-info-link">info@arirealestate.com</a>
          </div>
          <div className="ari-footer-info">
            <span className="ari-footer-info-title">Tel:</span>
            <a href="tel:+38348465726" className="ari-footer-info-link">+383 48 465 726</a>
          </div>
          <div className="ari-footer-info">
            <span className="ari-footer-info-title">Adresa:</span>
            <a 
              href="https://maps.app.goo.gl/ip4iUs994cqPUgjR6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ari-footer-info-link"
            >Gjilan, Kosovë</a>
          </div>

          <div className="ari-footer-socials">
            <a href="https://www.facebook.com/p/Ari-Real-Estate-61554838910212/" className="ari-footer-social-icon" target="_blank" rel="noopener noreferrer"><FacebookIcon /></a>
            <a href="https://www.instagram.com/ari_realestate.ks/" className="ari-footer-social-icon" target="_blank" rel="noopener noreferrer"><InstagramIcon /></a>
            <a href="https://www.tiktok.com/@ari_realestate1" className="ari-footer-social-icon" target="_blank" rel="noopener noreferrer"><TikTokIcon /></a>
          </div>
        </div>

        {/* --- Back to Top Button --- */}
        {/* <button className="ari-footer-backtotop" onClick={scrollToTop}>↑ Top</button> */}

      </div>

      {/* --- Copyright --- */}
      <div className="ari-footer-bottom">
        © 2025 Ari Real Estate. All rights reserved.
      </div>

    </footer>
  );
}
