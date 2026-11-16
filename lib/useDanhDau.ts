"use client";
import {useCallback, useSyncExternalStore} from "react";
const KHOA = "dethi.dadoc.v1";
const subs = new Set<() => void>();
let cache: Set<string> | null = null;
function doc(): Set<string> {
  if (!cache) {
    try {
      cache = new Set(JSON.parse(localStorage.getItem(KHOA) ?? "[]") as string[]);
    } catch {
      cache = new Set();
    }
  }
  return cache;
}
function luu() {
  localStorage.setItem(KHOA, JSON.stringify(Array.from(doc())));
  subs.forEach((f) => f());
}
export function useDanhDau() {
  const snap = useSyncExternalStore((cb) => {
    subs.add(cb);
    return () => subs.delete(cb);
  }, () => localStorage.getItem(KHOA) ?? "", () => "");
  const da = useCallback((id: string) => doc().has(id), [snap]);
  const danhDau = useCallback((id: string) => {
    doc().add(id);
    luu();
  }, []);
  const bo = useCallback((id: string) => {
    doc().delete(id);
    luu();
  }, []);
  const dao = useCallback((id: string) => {
    if (doc().has(id)) doc().delete(id);
    else doc().add(id);
    luu();
  }, []);
  return {da, danhDau, bo, dao};
}