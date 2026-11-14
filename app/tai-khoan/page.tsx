"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IconAlert, IconArrowRight, IconCalendar, IconCheck, IconClose, IconEdit, IconFile, IconLoader, IconSeal } from "@/components/Icons";
import Skeleton from "@/components/Skeleton";
import { buttonTap, EASE, fadeInUp, spring, staggerContainer } from "@/lib/animations";
import { useHoverCapable } from "@/lib/useHover";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
const ngayVN = (iso?: string | null) => {
  if (!iso) return "Chưa rõ";
  const p = iso.slice(0, 10).split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : "Chưa rõ";
};
const chuDau = (s: string) => {
  const w = s.trim().split(/\s+/).filter(Boolean);
  if (w.length === 0) return "DT";
  return w.slice(-2).map((x) => x[0]?.toUpperCase() ?? "").join("") || "DT";
};
const QUYEN = [
  { ten: "Xem và đọc đề trực tuyến", admin: true, user: true },
  { ten: "Tải đề về máy", admin: true, user: true },
  { ten: "Cập nhật hồ sơ và mật khẩu", admin: true, user: true },
  { ten: "Tải đề mới lên kho", admin: true, user: false },
  { ten: "Sửa thông tin đề", admin: true, user: false },
  { ten: "Xóa đề khỏi kho", admin: true, user: false },
];
export default function TrangCaNhan() {
  const { user, hoSo, isAdmin, loading, signOut, taiLaiHoSo } = useAuth();
  const router = useRouter();
  const hover = useHoverCapable();
  const [dangSua, setDangSua] = useState(false);
  const [hoTen, setHoTen] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [loiTen, setLoiTen] = useState("");
  const [tinTen, setTinTen] = useState("");
  const [mk1, setMk1] = useState("");
  const [mk2, setMk2] = useState("");
  const [dangDoi, setDangDoi] = useState(false);
  const [loiMk, setLoiMk] = useState("");
  const [tinMk, setTinMk] = useState("");
  const [daChep, setDaChep] = useState(false);
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  useEffect(() => {
    if (!dangSua) setHoTen(hoSo?.ho_ten ?? "");
  }, [hoSo?.ho_ten, dangSua]);
  useEffect(() => {
    if (!daChep) return;
    const t = setTimeout(() => setDaChep(false), 2000);
    return () => clearTimeout(t);
  }, [daChep]);
  const luuTen = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const giaTri = hoTen.trim();
    if (giaTri.length > 60) {
      setLoiTen("Họ tên tối đa 60 ký tự.");
      return;
    }
    setDangLuu(true);
    setLoiTen("");
    setTinTen("");
    const { error } = await supabase.from("profiles").update({ ho_ten: giaTri || null }).eq("id", user.id);
    setDangLuu(false);
    if (error) {
      setLoiTen(error.message);
      return;
    }
    await taiLaiHoSo();
    setTinTen("Đã lưu họ tên ✓");
    setDangSua(false);
  };
  const doiMatKhau = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoiMk("");
    setTinMk("");
    if (mk1.length < 6) {
      setLoiMk("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (mk1 !== mk2) {
      setLoiMk("Hai ô mật khẩu chưa khớp nhau.");
      return;
    }
    setDangDoi(true);
    const { error } = await supabase.auth.updateUser({ password: mk1 });
    setDangDoi(false);
    if (error) {
      setLoiMk(error.message);
      return;
    }
    setMk1("");
    setMk2("");
    setTinMk("Đã đổi mật khẩu ✓");
  };
  const chepMa = async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setDaChep(true);
    } catch {
      setDaChep(false);
    }
  };
  if (loading || !user) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-4xl px-4 pb-16 pt-10">
        <div className="flex items-center gap-2 text-sm text-ink-faint">
          <IconLoader className="h-4 w-4 animate-spin text-accent" />
          Đang tải hồ sơ...
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="sheet space-y-4 p-5 pl-8 shadow-paper lg:col-span-3">
            <Skeleton className="h-16 w-16" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-52 w-full" />
          </div>
        </div>
      </div>
    );
  }
  const tenHienThi = hoSo?.ho_ten?.trim() || user.email?.split("@")[0] || "Người dùng";
  const email = hoSo?.email ?? user.email ?? "";
  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl overflow-x-clip px-4 pb-16 pt-8 sm:pt-10">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full min-w-0">
        <motion.header variants={fadeInUp} className="w-full border-b-2 border-ink pb-5">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            <span>Hồ sơ người dùng</span>
            <span>Đề.Thi</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Trang <span className="text-accent">cá nhân</span>
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Xem thông tin tài khoản, đổi họ tên hiển thị và mật khẩu.</p>
        </motion.header>
        <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.section variants={fadeInUp} className="sheet relative min-w-0 overflow-hidden p-5 pl-8 shadow-paper lg:col-span-3">
            <motion.span
              initial={{ opacity: 0, scale: 1.4, rotate: -16 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={spring}
              className={`pointer-events-none absolute right-3 top-3 border-2 px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.16em] ${isAdmin ? "border-accent/70 text-accent/85" : "border-ink/40 text-ink-faint"}`}
            >
              {isAdmin ? "Quản trị" : "Học sinh"}
            </motion.span>
            <div className="flex items-center gap-4">
              <motion.span
                initial={{ scale: 1.25, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: -2, opacity: 1 }}
                transition={spring}
                className="grid h-16 w-16 shrink-0 place-items-center border-2 border-ink bg-paper font-display text-xl font-bold text-accent shadow-stamp"
              >
                {chuDau(tenHienThi)}
              </motion.span>
              <div className="min-w-0 pt-4">
                <p className="truncate font-display text-xl font-bold leading-tight text-ink">{tenHienThi}</p>
                <p className="mt-1 truncate text-sm text-ink-soft">{email}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-0 border-t border-dashed border-ink/25">
              <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink/20 py-2.5">
                <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">Vai trò</dt>
                <dd className={`flex items-center gap-1.5 text-sm font-semibold ${isAdmin ? "text-accent" : "text-ink"}`}>
                  <IconSeal className="h-4 w-4" />
                  {isAdmin ? "Quản trị viên" : "Người dùng"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink/20 py-2.5">
                <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">Ngày tham gia</dt>
                <dd className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <IconCalendar className="h-4 w-4 text-ink-faint" />
                  {ngayVN(hoSo?.created_at ?? user.created_at)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink/20 py-2.5">
                <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">Đăng nhập gần nhất</dt>
                <dd className="text-sm font-semibold text-ink">{ngayVN(user.last_sign_in_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="shrink-0 text-xs uppercase tracking-[0.12em] text-ink-faint">Mã tài khoản</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-xs text-ink-soft">{user.id.slice(0, 8)}</span>
                  <motion.button whileTap={buttonTap} type="button" onClick={chepMa} className="flex shrink-0 items-center gap-1 border border-ink/30 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors active:bg-accent-wash hover:border-accent hover:text-accent">
                    {daChep ? <IconCheck className="h-3 w-3 text-accent" /> : <IconFile className="h-3 w-3" />}
                    {daChep ? "Đã chép" : "Chép"}
                  </motion.button>
                </dd>
              </div>
            </dl>
            {isAdmin && (
              <Link href="/admin" className="mt-4 block">
                <motion.span whileTap={buttonTap} className="flex items-center justify-between gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent">
                  Vào trang quản trị
                  <IconArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            )}
          </motion.section>
          <motion.div variants={fadeInUp} className="min-w-0 space-y-6 lg:col-span-2">
            <form onSubmit={luuTen} className="min-w-0 border border-ink/25 bg-paper-light p-5 shadow-paper">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <IconEdit className="h-4 w-4 text-accent" />
                Họ tên hiển thị
              </h2>
              <AnimatePresence mode="wait" initial={false}>
                {dangSua ? (
                  <motion.div key="sua" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: EASE }} className="mt-3 space-y-3">
                    <input type="text" value={hoTen} onChange={(e) => setHoTen(e.target.value)} placeholder="Nguyễn Văn A" aria-label="Họ tên hiển thị" className="w-full min-w-0 border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent" />
                    <div className="flex gap-2">
                      <motion.button whileTap={buttonTap} type="submit" disabled={dangLuu} className="flex flex-1 items-center justify-center gap-1.5 border border-ink bg-ink px-3 py-2 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent disabled:opacity-60">
                        <IconCheck className="h-4 w-4" />
                        {dangLuu ? "Đang lưu" : "Lưu"}
                      </motion.button>
                      <motion.button whileTap={buttonTap} type="button" onClick={() => { setDangSua(false); setLoiTen(""); }} className="flex items-center gap-1.5 border border-ink/40 bg-paper px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep">
                        <IconClose className="h-4 w-4" />
                        Hủy
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="xem" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: EASE }} className="mt-3">
                    <p className="truncate border-b border-dashed border-ink/25 pb-2 text-sm text-ink">{hoSo?.ho_ten?.trim() || "Chưa đặt họ tên"}</p>
                    <motion.button whileTap={buttonTap} whileHover={hover ? { x: 3 } : undefined} type="button" onClick={() => { setDangSua(true); setTinTen(""); }} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-accent">
                      <IconEdit className="h-4 w-4" />
                      {hoSo?.ho_ten ? "Đổi họ tên" : "Đặt họ tên"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              {loiTen && <p className="mt-3 border border-accent/50 bg-accent-wash p-2.5 text-xs text-accent-deep">{loiTen}</p>}
              {tinTen && <p className="mt-3 text-xs font-semibold text-accent">{tinTen}</p>}
            </form>
            <form onSubmit={doiMatKhau} className="min-w-0 border border-ink/25 bg-paper-light p-5 shadow-paper">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <IconSeal className="h-4 w-4 text-accent" />
                Đổi mật khẩu
              </h2>
              <div className="mt-3 space-y-3">
                <input type="password" value={mk1} onChange={(e) => setMk1(e.target.value)} autoComplete="new-password" placeholder="Mật khẩu mới" aria-label="Mật khẩu mới" className="w-full min-w-0 border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent" />
                <input type="password" value={mk2} onChange={(e) => setMk2(e.target.value)} autoComplete="new-password" placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" className="w-full min-w-0 border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent" />
                <motion.button whileTap={buttonTap} type="submit" disabled={dangDoi} className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent disabled:opacity-60">
                  {dangDoi ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconCheck className="h-4 w-4" />}
                  {dangDoi ? "Đang đổi" : "Cập nhật mật khẩu"}
                </motion.button>
              </div>
              {loiMk && <p className="mt-3 border border-accent/50 bg-accent-wash p-2.5 text-xs text-accent-deep">{loiMk}</p>}
              {tinMk && <p className="mt-3 text-xs font-semibold text-accent">{tinMk}</p>}
            </form>
          </motion.div>
        </div>
        <motion.section variants={fadeInUp} className="sheet mt-6 min-w-0 p-5 pl-8 shadow-paper">
          <h2 className="font-display text-lg font-bold text-ink">Quyền hạn của bạn</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {isAdmin ? "Tài khoản quản trị viên được phép quản lý toàn bộ kho đề." : "Tài khoản thường xem và tải đề tự do, không truy cập được mục quản trị."}
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {QUYEN.map((q) => {
              const duoc = isAdmin ? q.admin : q.user;
              return (
                <li key={q.ten} className="flex items-center gap-2.5 border-b border-dashed border-ink/15 py-2 text-sm">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center border ${duoc ? "border-accent/60 text-accent" : "border-ink/25 text-ink-faint"}`}>
                    {duoc ? <IconCheck className="h-3 w-3" /> : <IconClose className="h-3 w-3" />}
                  </span>
                  <span className={duoc ? "text-ink" : "text-ink-faint line-through"}>{q.ten}</span>
                </li>
              );
            })}
          </ul>
          {!isAdmin && (
            <div className="mt-4 flex items-start gap-2.5 border border-ink/25 bg-paper p-3 text-xs text-ink-soft">
              <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>Cần quyền tải đề lên kho? Hãy liên hệ người quản lý website để được nâng cấp vai trò.</p>
            </div>
          )}
        </motion.section>
        <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/" className="flex-1">
            <motion.span whileTap={buttonTap} className="flex items-center justify-center border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
              Về kho đề
            </motion.span>
          </Link>
          <motion.button whileTap={buttonTap} type="button" onClick={() => signOut()} className="flex items-center justify-center gap-2 border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-paper-light transition-colors active:bg-accent-deep hover:bg-accent-deep">
            <IconClose className="h-4 w-4" />
            Đăng xuất
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}