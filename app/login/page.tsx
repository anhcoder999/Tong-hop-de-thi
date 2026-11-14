"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight, IconSeal, InkLine } from "@/components/Icons";
import { buttonTap, EASE, fadeInUp, spring, staggerContainer } from "@/lib/animations";
import { useAuth } from "@/lib/auth";
type CheDo = "login" | "register";
export default function TrangDangNhap() {
  const { user, hoSo, isAdmin, loading, signIn, signUp, signOut } = useAuth();
  const [cheDo, setCheDo] = useState<CheDo>("login");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loi, setLoi] = useState("");
  const [tin, setTin] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const gui = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoi("");
    setTin("");
    const mail = email.trim();
    if (!mail || !matKhau) {
      setLoi("Nhập đủ email và mật khẩu đã nhé.");
      return;
    }
    if (matKhau.length < 6) {
      setLoi("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    setDangGui(true);
    const kq = cheDo === "login" ? await signIn(mail, matKhau) : await signUp(mail, matKhau);
    setDangGui(false);
    if (kq.loi) {
      setLoi(kq.loi);
      return;
    }
    if (kq.canXacNhan) {
      setTin("Đăng ký xong. Hãy mở email và bấm link xác nhận, rồi quay lại đăng nhập.");
      setCheDo("login");
      return;
    }
    setMatKhau("");
  };
  return (
    <div className="mx-auto w-full min-w-0 max-w-md px-4 pb-16 pt-10 sm:pt-16">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full min-w-0">
        <motion.header variants={fadeInUp} className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center border border-ink/40 bg-paper-light text-ink">
            <IconSeal className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
            {cheDo === "login" ? "Đăng nhập" : "Đăng ký"}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Học sinh xem đề không cần tài khoản. Tài khoản dùng để lưu hồ sơ, riêng mục quản trị chỉ dành cho quản trị viên.</p>
        </motion.header>
        {loading ? (
          <motion.p variants={fadeInUp} className="mt-8 text-center text-sm text-ink-faint">
            Đang kiểm tra phiên...
          </motion.p>
        ) : user ? (
          <motion.div variants={fadeInUp} className="sheet mt-8 space-y-4 p-5 pl-8 shadow-paper">
            <p className="text-sm text-ink-soft">Đang đăng nhập bằng</p>
            <p className="truncate font-display text-lg font-bold text-ink">{hoSo?.ho_ten?.trim() || user.email}</p>
            <span className={`inline-block border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${isAdmin ? "border-accent/70 text-accent" : "border-ink/40 text-ink-soft"}`}>
              {isAdmin ? "Quản trị viên" : "Người dùng"}
            </span>
            <div className="flex flex-col gap-2.5 pt-1">
              <Link href="/tai-khoan">
                <motion.span whileTap={buttonTap} className="flex items-center justify-between gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent">
                  Trang cá nhân
                  <IconArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <motion.span whileTap={buttonTap} className="flex items-center justify-between gap-2 border border-accent bg-accent-wash px-4 py-2.5 text-sm font-semibold text-accent-deep transition-colors active:bg-accent active:text-paper-light hover:bg-accent hover:text-paper-light">
                    Vào quản trị
                    <IconArrowRight className="h-4 w-4" />
                  </motion.span>
                </Link>
              )}
              <div className="flex gap-2.5">
                <Link href="/" className="flex-1">
                  <motion.span whileTap={buttonTap} className="flex items-center justify-center border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
                    Về trang chủ
                  </motion.span>
                </Link>
                <motion.button whileTap={buttonTap} type="button" onClick={() => signOut()} className="border border-ink/40 bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep">
                  Đăng xuất
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form variants={fadeInUp} onSubmit={gui} className="sheet mt-8 space-y-4 p-5 pl-8 shadow-paper">
            <div className="flex gap-6 border-b border-ink/20">
              {(["login", "register"] as CheDo[]).map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  whileTap={buttonTap}
                  onClick={() => {
                    setCheDo(c);
                    setLoi("");
                    setTin("");
                  }}
                  className={`relative pb-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${cheDo === c ? "text-accent" : "text-ink-soft hover:text-ink"}`}
                >
                  {c === "login" ? "Đăng nhập" : "Đăng ký"}
                  {cheDo === c && (
                    <motion.span layoutId="auth-ink" transition={spring} className="absolute inset-x-0 -bottom-px text-accent">
                      <InkLine className="h-1.5 w-full" />
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="min-w-0">
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@vidu.com" className="w-full min-w-0 border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent" />
            </div>
            <div className="min-w-0">
              <label htmlFor="matkhau" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Mật khẩu</label>
              <input id="matkhau" type="password" autoComplete={cheDo === "login" ? "current-password" : "new-password"} value={matKhau} onChange={(e) => setMatKhau(e.target.value)} placeholder="Tối thiểu 6 ký tự" className="w-full min-w-0 border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent" />
            </div>
            {loi && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="border border-accent/50 bg-accent-wash p-3 text-sm text-accent-deep">
                {loi}
              </motion.p>
            )}
            {tin && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="border border-ink/30 bg-paper p-3 text-sm text-ink-soft">
                {tin}
              </motion.p>
            )}
            <motion.button whileTap={buttonTap} type="submit" disabled={dangGui} className="flex w-full items-center justify-center border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent disabled:opacity-60">
              {dangGui ? "Đang xử lý..." : cheDo === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </motion.button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}