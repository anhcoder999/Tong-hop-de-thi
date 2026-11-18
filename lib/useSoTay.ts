"use client";
import {useCallback, useMemo, useSyncExternalStore} from "react";
export type SoTay = {bm: number[]; note: Record<string, string>; last: number};
const KHOA = (id: string) => `dethi.sotay.${id}`;
const subs = new Map<string, Set<() => void>>();
const cache = new Map<string, SoTay>();
function rong(): SoTay {
  return {bm: [], note: {}, last: 1};
}
function doc(id: string): SoTay {
  let v = cache.get(id);
  if (!v) {
    try {
      const raw = JSON.parse(localStorage.getItem(KHOA(id)) ?? "null") as Partial<SoTay> | null;
      v = {bm: Array.isArray(raw?.bm) ? raw.bm.filter((n) => typeof n === "number") : [], note: raw?.note && typeof raw.note === "object" ? (raw.note as Record<string, string>) : {}, last: typeof raw?.last === "number" ? raw.last : 1};
    } catch {
      v = rong();
    }
    cache.set(id, v);
  }
  return v;
}
function luu(id: string) {
  localStorage.setItem(KHOA(id), JSON.stringify(doc(id)));
  subs.get(id)?.forEach((f) => f());
}
export function useSoTay(id: string) {
  const snap = useSyncExternalStore((cb) => {
    let s = subs.get(id);
    if (!s) {
      s = new Set();
      subs.set(id, s);
    }
    s.add(cb);
    return () => {
      s.delete(cb);
    };
  }, () => localStorage.getItem(KHOA(id)) ?? "", () => "");
  const data = useMemo<SoTay>(() => {
    if (!snap) return rong();
    try {
      const raw = JSON.parse(snap) as Partial<SoTay>;
      return {bm: Array.isArray(raw.bm) ? raw.bm : [], note: raw.note && typeof raw.note === "object" ? raw.note : {}, last: typeof raw.last === "number" ? raw.last : 1};
    } catch {
      return rong();
    }
  }, [snap]);
  const toggleBm = useCallback((trang: number) => {
    const v = doc(id);
    v.bm = v.bm.includes(trang) ? v.bm.filter((p) => p !== trang) : [...v.bm, trang];
    luu(id);
  }, [id]);
  const setNote = useCallback((trang: number, text: string) => {
    const v = doc(id);
    if (text.trim()) v.note[String(trang)] = text;
    else delete v.note[String(trang)];
    luu(id);
  }, [id]);
  const setLast = useCallback((trang: number) => {
    const v = doc(id);
    if (v.last !== trang) {
      v.last = trang;
      luu(id);
    }
  }, [id]);
  return {...data, toggleBm, setNote, setLast};
}