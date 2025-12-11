import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteIcon from "@mui/icons-material/MusicNote";


const Contact = () => {
  return (
    <section className="contact-section">
      <div className="contact-container">

        <h2 className="contact-title">Kontakti</h2>
        <p className="contact-subtitle">
          Na kontaktoni për çdo informacion shtesë.
        </p>

        <div className="contact-grid">

          <div className="contact-item">
            <h3>Email</h3>
            <a href="mailto:info@arirealestate.com">info@arirealestate.com</a>
          </div>

          <div className="contact-item">
            <h3>Telefoni</h3>
            <a href="tel:+38348465726">+383 48 465 726</a>
          </div>

          <div className="contact-item">
            <h3>Adresa</h3>
            <a href="https://maps.app.goo.gl/ip4iUs994cqPUgjR6">Gjilan, Kosovë</a>
          </div>

          <div className="contact-item">
      <h3>Rrjetet Sociale</h3>

      <div className="social-links">
        <a href="https://www.facebook.com/p/Ari-Real-Estate-61554838910212/" className="social-icon" target="_blank" rel="noopener noreferrer">
          <FacebookIcon />
        </a>

        <a href="https://www.instagram.com/ari_realestate.ks/" className="social-icon" target="_blank" rel="noopener noreferrer">
          <InstagramIcon />
        </a>

        <a href="https://www.tiktok.com/@ari_realestate1" className="social-icon" target="_blank" rel="noopener noreferrer">
          <MusicNoteIcon />
        </a>
      </div>
    </div>


        </div>
      </div>
    </section>
  );
};

export default Contact;
