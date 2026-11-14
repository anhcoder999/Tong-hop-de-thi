"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, X } from "lucide-react";
import DeCard from "@/components/DeCard";
import EmptyState from "@/components/EmptyState";
import { DeCardSkeleton } from "@/components/Skeleton";
import { DS_DE, DS_TAB, type Tab } from "@/lib/data";
import { buttonTap, fadeInUp, spring, staggerContainer } from "@/lib/animations";
// Bỏ dấu tiếng Việt để gõ "toan" vẫn tìm ra "Toán", tối ưu cho mobile
const khongDau = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
export default function TrangChu() {
  const [tuKhoa, setTuKhoa] = useState("");
  const [tab, setTab] = useState<Tab>("Tất cả");
  const [dangTai, setDangTai] = useState(true);
  // Giả lập gọi API lần đầu để khoe skeleton shimmer, nối API thật thì thay chỗ này
  useEffect(() => {
    const t = setTimeout(() => setDangTai(false), 500);
    return () => clearTimeout(t);
  }, []);
  // Đếm số đề mỗi môn, hiển thị ngay trên tab
  const demTheoMon = useMemo(() => {
    const m = new Map<string, number>();
    DS_DE.forEach((d) => m.set(d.mon, (m.get(d.mon) ?? 0) + 1));
    return m;
  }, []);
  // Lọc kép: theo môn đang chọn + theo từ khóa tên đề
  const ketQua = useMemo(() => {
    const tu = khongDau(tuKhoa.trim());
    return DS_DE.filter((d) => (tab === "Tất cả" || d.mon === tab) && khongDau(d.ten).includes(tu));
  }, [tab, tuKhoa]);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:pt-12">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.header variants={fadeInUp} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles size={13} />
            Cập nhật mỗi ngày - Miễn phí 100%
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Website <span className="text-gradient">Tổng Hợp Đề Thi</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
            Kho đề Toán, Văn, Anh, Sử, Địa, KTPL chọn lọc. Xem PDF trực tiếp, tải về ôn luyện ngay trên điện thoại.
          </p>
        </motion.header>
        <motion.div variants={fadeInUp} className="relative mx-auto mt-8 max-w-xl">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm đề theo tên... (gõ không dấu cũng được)"
            aria-label="Tìm đề theo tên"
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-11 py-3.5 text-sm shadow-soft outline-none backdrop-blur transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          {tuKhoa && (
            <motion.button
              whileTap={buttonTap}
              onClick={() => setTuKhoa("")}
              aria-label="Xóa từ khóa"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </motion.button>
          )}
        </motion.div>
        <motion.div variants={fadeInUp} className="-mx-4 mt-6 overflow-x-auto px-4 no-scrollbar">
          <div className="flex w-max min-w-full gap-1.5 border-b border-slate-200/80 pb-px sm:justify-center">
            {DS_TAB.map((t) => {
              const dangChon = tab === t;
              const soDe = t === "Tất cả" ? DS_DE.length : demTheoMon.get(t) ?? 0;
              return (
                <motion.button
                  key={t}
                  whileTap={buttonTap}
                  onClick={() => setTab(t)}
                  className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    dangChon ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {t}
                  <span className={`ml-1.5 text-xs ${dangChon ? "text-brand-400" : "text-slate-400"}`}>{soDe}</span>
                  {/* layoutId giúp gạch chân trượt mượt từ tab cũ sang tab mới */}
                  {dangChon && (
                    <motion.span
                      layoutId="tab-underline"
                      transition={spring}
                      className="absolute inset-x-3 -bottom-[3px] h-0.5 rounded-full bg-brand-gradient"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
      <p className="mt-6 text-sm text-slate-500">
        Tìm thấy <b className="text-slate-800">{dangTai ? "..." : ketQua.length}</b> đề
      </p>
      {dangTai ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DeCardSkeleton key={i} />
          ))}
        </div>
      ) : ketQua.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            onReset={() => {
              setTuKhoa("");
              setTab("Tất cả");
            }}
          />
        </div>
      ) : (
        // key theo tab: đổi môn là dàn card stagger lại từ đầu, mỗi card cách nhau 50ms
        <motion.div
          key={tab}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ketQua.map((d) => (
            <DeCard key={d.id} de={d} />
          ))}
        </motion.div>
      )}
    </div>
  );
}