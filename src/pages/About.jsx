import React from "react";

const AboutAri = () => {
  return (
    <div className="ari-about-wrapper">
      {/* Section 1 – Hero */}
      <section className="ari-about-hero">
        <div className="ari-about-overlay"></div>
        <div className="ari-about-hero-content">
          <h1 className="ari-about-title">Ari Real Estate</h1>
          <p className="ari-about-subtitle">
            Një platformë moderne për menaxhimin, shitjen dhe dhënien me qera të
            pronave me teknologjitë më të fundit.
          </p>
        </div>
      </section>

      {/* Section 2 – Mission */}
      <section className="ari-about-section">
        <h2 className="ari-section-title">Misioni Ynë</h2>
        <p className="ari-section-text">
          Synojmë të krijojmë një rrjet të gjerë, të shpejtë dhe të sigurt
          ku përdoruesit mund të gjejnë pronën ideale të ëndrrave.
        </p>
      </section>

      {/* Section 3 – Features */}
      <section className="ari-features-grid">
        <div className="ari-feature-card">
          <h3 className="ari-feature-title">🔍 Kërkim i Avancuar</h3>
          <p className="ari-feature-text">
            Filtrim sipas kategorisë, zonës, statusit dhe preferencave, në një UI
            modern dhe të lehtë për përdorim.
          </p>
        </div>

        <div className="ari-feature-card">
          <h3 className="ari-feature-title">📍 Hartë Interaktive</h3>
          <p className="ari-feature-text">
            Shiko pronat në hartë dhe gjej opsionin më të afërt për nevojat e tua.
          </p>
        </div>

        <div className="ari-feature-card">
          <h3 className="ari-feature-title">💬 Rezervim Takimesh</h3>
          <p className="ari-feature-text">
            Përdoruesit mund të rezervojnë takime të cilat aprovohen nga
            agjentët tanë të lirë.
          </p>
        </div>

        <div className="ari-feature-card">
          <h3 className="ari-feature-title">⚡ Teknologji Moderne</h3>
          <p className="ari-feature-text">
            Përdorimi i teknologjisë së fundit për reklamimin e pronave.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutAri;
