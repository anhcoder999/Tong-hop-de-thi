"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
export type VaiTro = "user" | "admin";
export type HoSo = {
  id: string;
  email: string | null;
  role: VaiTro;
  ho_ten: string | null;
  created_at: string | null;
  updated_at: string | null;
};
export type KetQua = { loi: string | null; canXacNhan?: boolean };
type AuthState = {
  user: User | null;
  hoSo: HoSo | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<KetQua>;
  signUp: (email: string, password: string) => Promise<KetQua>;
  signOut: () => Promise<void>;
  taiLaiHoSo: () => Promise<void>;
  capNhatHoTen: (ten: string) => Promise<KetQua>;
};
const Ctx = createContext<AuthState | null>(null);
const docHoSo = (data: Record<string, unknown> | null): HoSo | null => {
  if (!data) return null;
  return {
    id: String(data.id),
    email: (data.email as string | null) ?? null,
    role: data.role === "admin" ? "admin" : "user",
    ho_ten: (data.ho_ten as string | null) ?? null,
    created_at: (data.created_at as string | null) ?? null,
    updated_at: (data.updated_at as string | null) ?? null,
  };
};
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [phienXong, setPhienXong] = useState(false);
  const [hoSoXong, setHoSoXong] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setPhienXong(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setPhienXong(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  const uid = session?.user?.id;
  const napHoSo = useCallback(async (id: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    return docHoSo(data as Record<string, unknown> | null);
  }, []);
  useEffect(() => {
    let alive = true;
    if (!uid) {
      setHoSo(null);
      setHoSoXong(true);
      return;
    }
    setHoSoXong(false);
    napHoSo(uid).then((h) => {
      if (!alive) return;
      setHoSo(h);
      setHoSoXong(true);
    });
    return () => {
      alive = false;
    };
  }, [uid, napHoSo]);
  const taiLaiHoSo = useCallback(async () => {
    if (!uid) return;
    const h = await napHoSo(uid);
    setHoSo(h);
  }, [uid, napHoSo]);
  const capNhatHoTen = useCallback(
    async (ten: string): Promise<KetQua> => {
      if (!uid) return { loi: "Phiên đăng nhập đã hết. Hãy đăng nhập lại." };
      const giaTri = ten.trim() ? ten.trim() : null;
      const cu = hoSo;
      setHoSo((h) => (h ? { ...h, ho_ten: giaTri } : h));
      const { data, error } = await supabase.from("profiles").update({ ho_ten: giaTri }).eq("id", uid).select("*").maybeSingle();
      if (error) {
        setHoSo(cu);
        return { loi: error.message };
      }
      const moi = docHoSo(data as Record<string, unknown> | null);
      if (!moi) {
        setHoSo(cu);
        return { loi: "Chưa ghi được vào hồ sơ. Hãy chạy lại supabase/profile.sql trong SQL Editor để mở policy UPDATE." };
      }
      setHoSo(moi);
      return { loi: null };
    },
    [uid, hoSo],
  );
  const signIn = useCallback(async (email: string, password: string): Promise<KetQua> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { loi: error ? error.message : null };
  }, []);
  const signUp = useCallback(async (email: string, password: string): Promise<KetQua> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { loi: error.message };
    return { loi: null, canXacNhan: !data.session };
  }, []);
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setHoSo(null);
  }, []);
  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      hoSo,
      isAdmin: hoSo?.role === "admin",
      loading: !phienXong || !hoSoXong,
      signIn,
      signUp,
      signOut,
      taiLaiHoSo,
      capNhatHoTen,
    }),
    [session, hoSo, phienXong, hoSoXong, signIn, signUp, signOut, taiLaiHoSo, capNhatHoTen],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}