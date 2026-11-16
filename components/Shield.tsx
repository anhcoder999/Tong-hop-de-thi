"use client";
import {useEffect, useState} from "react";
import {IconAlert, IconClose, IconSeal} from "@/components/Icons";
const KHOA_THEME = "dethi.theme";
function nat(fn: unknown): boolean {
  return typeof fn === "function" && /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(fn));
}
export default function Shield() {
  const [chan, setChan] = useState(false);
  const [canhBao, setCanhBao] = useState("");
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
    const trongPdf = (t: EventTarget | null) => t instanceof Element && !!t.closest("[data-pdf-zoom]");
    const khoaZoom = (e: Event) => {
      if (trongPdf(e.target)) return;
      e.preventDefault();
    };
    const phim = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) khoaZoom(e);
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
    const mo = new MutationObserver((ds) => {
      for (const d of ds) {
        for (const n of Array.from(d.addedNodes)) {
          if (n instanceof HTMLScriptElement && n.src && !n.src.startsWith(location.origin) && !n.src.startsWith("https://cdn.jsdelivr.net")) setChan(true);
          if (n instanceof HTMLIFrameElement && !n.src.startsWith(location.origin)) setChan(true);
        }
      }
    });
    mo.observe(document.documentElement, {childList: true, subtree: true});
    const quet = setInterval(() => {
      const t0 = performance.now();
      (function () {}).constructor("debugger")();
      if (performance.now() - t0 > 60) setChan(true);
      if (window.outerWidth - window.innerWidth > 180 || window.outerHeight - window.innerHeight > 220) setChan(true);
      if (!nat(window.fetch) || !nat(XMLHttpRequest.prototype.open) || !nat(document.createElement)) setChan(true);
    }, 2500);
    (async () => {
      const canh: string[] = [];
      try {
        const c = document.createElement("canvas");
        const gl = c.getContext("webgl");
        const dbg = gl?.getExtension("WEBGL_debug_renderer_info");
        const renderer = dbg ? String(gl?.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
        if (/swiftshader|llvmpipe|vmware|virtualbox|bochs|software/i.test(renderer)) canh.push("máy ảo / render phần mềm");
      } catch {
        canh.push("máy ảo / render phần mềm");
      }
      if ((navigator.hardwareConcurrency || 8) <= 2) canh.push("thiết bị giả lập");
      try {
        const est = await navigator.storage?.estimate?.();
        if (est && typeof est.quota === "number" && est.quota < 300 * 1024 * 1024) canh.push("trình duyệt riêng tư");
      } catch {
        canh.push("trình duyệt riêng tư");
      }
      if (canh.length) setCanhBao(`Môi trường đáng ngờ: ${canh.join(", ")}. Một số tính năng có thể bị hạn chế.`);
    })();
    return () => {
      window.removeEventListener("keydown", phim);
      window.removeEventListener("wheel", lan);
      window.removeEventListener("touchmove", cham);
      window.removeEventListener("gesturestart", khoaZoom);
      window.removeEventListener("gesturechange", khoaZoom);
      mo.disconnect();
      clearInterval(quet);
    };
  }, []);
  return (
    <>
      <button type="button" onClick={doiTheme} aria-label="Đổi giao diện sáng tối" className="fixed bottom-4 left-4 z-[85] grid h-11 w-11 place-items-center border-2 border-ink bg-paper-light text-ink shadow-lift transition-colors hover:border-accent hover:text-accent">
        {toi ? <IconSeal className="h-5 w-5" /> : <IconClose className="h-5 w-5" />}
      </button>
      {canhBao && !chan && (
        <div className="fixed inset-x-3 top-3 z-[86] mx-auto flex max-w-lg items-start gap-2 border border-warn bg-paper-light p-3 text-xs text-ink shadow-lift">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
          <p className="min-w-0 flex-1">{canhBao}</p>
          <button type="button" onClick={() => setCanhBao("")} aria-label="Đóng cảnh báo" className="shrink-0 text-ink-faint hover:text-accent">
            <IconClose className="h-4 w-4" />
          </button>
        </div>
      )}
      {chan && (
        <div className="fixed inset-0 z-[999] grid place-items-center bg-ink/80 p-4 backdrop-blur-md">
          <div className="sheet max-w-md border-2 border-danger bg-paper-light p-6 text-center shadow-lift">
            <IconAlert className="mx-auto h-8 w-8 text-danger" />
            <h2 className="mt-3 font-display text-2xl font-bold text-ink">Phát hiện can thiệp</h2>
            <p className="mt-2 text-sm text-ink-soft">Công cụ gỡ lỗi, script lạ hoặc hook trình duyệt đang hoạt động. Đóng chúng và tải lại trang để tiếp tục sử dụng kho đề.</p>
            <button type="button" onClick={() => location.reload()} className="mt-4 w-full border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">Tải lại trang</button>
          </div>
        </div>
      )}
    </>
  );
}