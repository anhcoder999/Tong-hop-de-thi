"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
export type KetQua = { loi: string | null; canXacNhan?: boolean };
type AuthState = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<KetQua>;
  signUp: (email: string, password: string) => Promise<KetQua>;
  signOut: () => Promise<void>;
};
const Ctx = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  const uid = session?.user?.id;
  useEffect(() => {
    let alive = true;
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setIsAdmin(data?.role === "admin");
      });
    return () => {
      alive = false;
    };
  }, [uid]);
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
    setIsAdmin(false);
  }, []);
  const value = useMemo<AuthState>(
    () => ({ user: session?.user ?? null, isAdmin, loading, signIn, signUp, signOut }),
    [session, isAdmin, loading, signIn, signUp, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}