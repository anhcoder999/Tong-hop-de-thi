"use client";
import {useEffect, useRef} from "react";
const SITE = "0x4AAAAAAGDiRN2V6br5DoGP";
declare global {
  interface Window {
    turnstile?: {render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void};
  }
}
export default function Turnstile({onChange, resetKey}: {onChange: (t: string | null) => void; resetKey?: number}) {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  useEffect(() => {
    let alive = true;
    const render = () => {
      if (!ref.current || !window.turnstile) return;
      idRef.current = window.turnstile.render(ref.current, {sitekey: SITE, callback: (t: string) => onChange(t), "expired-callback": () => onChange(null), "error-callback": () => onChange(null), theme: "auto", appearance: "always"});
    };
    if (window.turnstile) render();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = () => {
        if (alive) render();
      };
      document.head.appendChild(s);
    }
    return () => {
      alive = false;
      if (idRef.current && window.turnstile) {
        try {
          window.turnstile.remove(idRef.current);
        } catch {
          idRef.current = null;
        }
      }
    };
  }, [onChange]);
  useEffect(() => {
    if (resetKey === undefined || !idRef.current || !window.turnstile) return;
    try {
      window.turnstile.reset(idRef.current);
    } catch {
      idRef.current = null;
    }
    onChange(null);
  }, [resetKey, onChange]);
  return <div ref={ref} className="min-h-[65px]" />;
}