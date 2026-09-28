import { useEffect, useRef, useState } from "react";

const siteKey = import.meta.env.DEV
  ? (import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA")
  : import.meta.env.VITE_TURNSTILE_SITE_KEY;

let scriptPromise;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => reject(new Error("Turnstile could not load"));
      document.head.appendChild(script);
    }).catch((error) => {
      scriptPromise = undefined;
      throw error;
    });
  }
  return scriptPromise;
}

export default function TurnstileWidget({ action, onToken, resetKey }) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const onTokenRef = useRef(onToken);
  const [loadError, setLoadError] = useState(false);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!siteKey) return undefined;
    let active = true;
    loadTurnstile()
      .then((turnstile) => {
        if (!active || !turnstile || !containerRef.current) return;
        widgetRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: "flexible",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
      })
      .catch(() => {
        if (active) {
          onTokenRef.current("");
          setLoadError(true);
        }
      });
    return () => {
      active = false;
      if (widgetRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [action]);

  useEffect(() => {
    if (resetKey > 0 && widgetRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
    }
  }, [resetKey]);

  if (!siteKey) return <p role="alert" className="text-sm text-red-700">Verifikimi nuk është konfiguruar. Ju lutemi na kontaktoni me telefon.</p>;
  return <div>
    <div ref={containerRef} aria-label="Verifikimi kundër abuzimit" />
    {loadError && <p role="alert" className="mt-2 text-sm text-red-700">Verifikimi nuk u ngarkua. Rifreskoni faqen dhe provoni përsëri.</p>}
  </div>;
}
