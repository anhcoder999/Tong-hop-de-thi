"use client";
import { useEffect, useState } from "react";
export function useHoverCapable() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const f = () => setOk(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return ok;
}