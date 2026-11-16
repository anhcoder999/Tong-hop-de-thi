"use client";
import {useEffect, useState} from "react";
import {IconAlert, IconClose, IconSeal} from "@/components/Icons";
const KHOA_THEME = "dethi.theme";
const CSS = "*{-webkit-touch-callout:none!important}html,body,input,textarea,select,[contenteditable]{-webkit-user-select:none!important;user-select:none!important}";
const trongPdf = (t: EventTarget | null) => t instanceof Element && !!t.closest("[data-pdf-zoom]");
const nat = (fn: unknown) => typeof fn === "function" && /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(fn));
const hopLe = (src: string) => src.startsWith(location.origin) || src.startsWith("https://cdn.jsdelivr.net") || src.startsWith("https://challenges.cloudflare.com");
export default function Shield() {
  const [chan, setChan] = useState(false);
  const [toi, setToi] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const luu = localStorage.getItem(KHOA_THEME);
    const dark = luu ? luu === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", dark);
    setToi(dark);
  }, []);
  const doiTheme = () => {
    const root = document.documentElement;
    const dark = !root.classList.contains("dark");
    root.classList.toggle("dark", dark);
    localStorage.setItem(KHOA_THEME, dark ? "dark" : "light");
    setToi(dark);
  };
  useEffect(() => {
    const khoaZoom = (e: Event) => {
      if (trongPdf(e.target)) return;
      e.preventDefault();
    };
    const chan = (e: Event) => e.preventDefault();
    const chanInput = (e: InputEvent) => {
      if (e.inputType === "insertFromPaste" || e.inputType === "insertFromDrop" || e.inputType === "insertFromYank") e.preventDefault();
    };
    const phim = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "F12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(k))) {
        e.preventDefault();
        setChan(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) {
        khoaZoom(e);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "a", "s", "p", "u"].includes(k)) e.preventDefault();
    };
    const lan = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) khoaZoom(e);
    };
    const cham = (e: TouchEvent) => {
      if (e.touches.length > 1) khoaZoom(e);
    };
    window.addEventListener("keydown", phim);
    window.addEventListener("wheel", lan, {passive: false});
    window.addEventListener("touchmove", cham, {passive: false});
    window.addEventListener("gesturestart", khoaZoom);
    window.addEventListener("gesturechange", khoaZoom);
    document.addEventListener("copy", chan);
    document.addEventListener("cut", chan);
    document.addEventListener("paste", chan);
    document.addEventListener("beforeinput", chanInput as EventListener);
    document.addEventListener("contextmenu", chan);
    document.addEventListener("selectstart", chan);
    document.addEventListener("dragstart", chan);
    document.addEventListener("dragover", chan);
    document.addEventListener("drop", chan);
    const mo = new MutationObserver((ds) => {
      for (const d of ds) {
        for (const n of Array.from(d.addedNodes)) {
          if (n instanceof HTMLScriptElement && n.src && !hopLe(n.src)) setChan(true);
          if (n instanceof HTMLIFrameElement && n.src && !hopLe(n.src)) setChan(true);
        }
      }
    });
    mo.observe(document.head, {childList: true});
    mo.observe(document.body, {childList: true});
    const quet = setInterval(() => {
      if (document.hidden) return;
      if (window.matchMedia("(min-width: 1024px)").matches && (window.outerWidth - window.innerWidth > 180 || window.outerHeight - window.innerHeight > 220)) setChan(true);
      if (!nat(window.fetch) || !nat(XMLHttpRequest.prototype.open) || !nat(document.createElement)) setChan(true);
      const t0 = performance.now();
      (function () {}).constructor("debugger")();
      if (performance.now() - t0 > 60) setChan(true);
    }, 3000);
    return () => {
      window.removeEventListener("keydown", phim);
      window.removeEventListener("wheel", lan);
      window.removeEventListener("touchmove", cham);
      window.removeEventListener("gesturestart", khoaZoom);
      window.removeEventListener("gesturechange", khoaZoom);
      document.removeEventListener("copy", chan);
      document.removeEventListener("cut", chan);
      document.removeEventListener("paste", chan);
      document.removeEventListener("beforeinput", chanInput as EventListener);
      document.removeEventListener("contextmenu", chan);
      document.removeEventListener("selectstart", chan);
      document.removeEventListener("dragstart", chan);
      document.removeEventListener("dragover", chan);
      document.removeEventListener("drop", chan);
      mo.disconnect();
      clearInterval(quet);
    };
  }, []);
  return (
    <>
      <style>{CSS}</style>
      <button type="button" onClick={doiTheme} aria-label="Đổi giao diện sáng tối" className="fixed bottom-4 left-4 z-[85] grid h-11 w-11 place-items-center border-2 border-ink bg-paper-light text-ink shadow-lift transition-colors hover:border-accent hover:text-accent">
        {toi ? <IconSeal className="h-5 w-5" /> : <IconClose className="h-5 w-5" />}
      </button>
      {chan && (
        <div className="fixed inset-0 z-[999] grid place-items-center bg-ink/80 p-4 backdrop-blur-md">
          <div className="sheet max-w-md border-2 border-danger bg-paper-light p-6 text-center shadow-lift">
            <IconAlert className="mx-auto h-8 w-8 text-danger" />
            <h2 className="mt-3 font-display text-2xl font-bold text-ink">Phát hiện can thiệp</h2>
            <p className="mt-2 text-sm text-ink-soft">Công cụ gỡ lỗi hoặc script/hook lạ đang hoạt động. Đóng chúng và tải lại trang để tiếp tục sử dụng kho đề.</p>
            <button type="button" onClick={() => location.reload()} className="mt-4 w-full border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">Tải lại trang</button>
          </div>
        </div>
      )}
    </>
  );
}