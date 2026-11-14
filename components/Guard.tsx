"use client";
import { useEffect, useState } from "react";
export default function Guard() {
  const [chan, setChan] = useState(false);
  useEffect(() => {
    const doc = document;
    const root = doc.documentElement;
    const editable = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
    const blockEditable = (e: Event) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "F12" || (mod && e.shiftKey && (k === "i" || k === "j" || k === "c")) || (mod && (k === "u" || k === "s" || k === "p"))) {
        e.preventDefault();
        return;
      }
      if (mod && (k === "+" || k === "-" || k === "=" || k === "0")) {
        e.preventDefault();
        return;
      }
      if (mod && (k === "c" || k === "x" || k === "v" || k === "a")) {
        if (!editable(e.target)) e.preventDefault();
        return;
      }
      if (e.key === "PrintScreen") {
        e.preventDefault();
        if (navigator.clipboard) navigator.clipboard.writeText("").catch(() => undefined);
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    const onGesture = (e: Event) => e.preventDefault();
    const onBlur = () => root.classList.add("peek");
    const onFocus = () => root.classList.remove("peek");
    let hit = false;
    const probe = {
      get id() {
        hit = true;
        return "";
      },
    };
    const tick = () => {
      hit = false;
      console.log(probe);
      console.clear();
      const gap = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
      setChan(hit || gap);
    };
    const iv = window.setInterval(tick, 1500);
    root.classList.add("guarded");
    doc.addEventListener("contextmenu", blockEditable);
    doc.addEventListener("copy", blockEditable);
    doc.addEventListener("cut", blockEditable);
    doc.addEventListener("paste", blockEditable);
    doc.addEventListener("selectstart", blockEditable);
    doc.addEventListener("dragstart", blockEditable);
    doc.addEventListener("keydown", onKey);
    doc.addEventListener("wheel", onWheel, { passive: false });
    doc.addEventListener("touchmove", onTouch, { passive: false });
    doc.addEventListener("gesturestart", onGesture);
    doc.addEventListener("gesturechange", onGesture);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(iv);
      root.classList.remove("guarded", "peek");
      doc.removeEventListener("contextmenu", blockEditable);
      doc.removeEventListener("copy", blockEditable);
      doc.removeEventListener("cut", blockEditable);
      doc.removeEventListener("paste", blockEditable);
      doc.removeEventListener("selectstart", blockEditable);
      doc.removeEventListener("dragstart", blockEditable);
      doc.removeEventListener("keydown", onKey);
      doc.removeEventListener("wheel", onWheel);
      doc.removeEventListener("touchmove", onTouch);
      doc.removeEventListener("gesturestart", onGesture);
      doc.removeEventListener("gesturechange", onGesture);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  if (!chan) return null;
  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-paper/95 p-6 text-center backdrop-blur-xl">
      <div className="max-w-sm border-2 border-ink bg-paper-light p-6 shadow-lift">
        <p className="font-display text-2xl font-bold text-accent">Khu vực bảo vệ</p>
        <p className="mt-2 text-sm text-ink-soft">Hãy tắt công cụ dành cho nhà phát triển hoặc cửa sổ lạ để tiếp tục xem đề.</p>
      </div>
    </div>
  );
}