"use client";
import {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {IconSeal, InkLine} from "@/components/Icons";
import Dashboard from "@/components/Dashboard";
import AdminPanel from "@/components/AdminPanel";
import ThiThuAdmin from "@/components/ThiThuAdmin";
import GhimDe from "@/components/GhimDe";
import ThongBaoAdmin from "@/components/ThongBaoAdmin";
import BinhLuanAdmin from "@/components/BinhLuanAdmin";
import NguoiDungAdmin from "@/components/NguoiDungAdmin";
import {EASE, spring} from "@/lib/animations";
const TABS = [
  {id: "tong-quan", nhan: "Tổng quan"},
  {id: "de-pdf", nhan: "Đề PDF"},
  {id: "thi-online", nhan: "Thi online"},
  {id: "ghim", nhan: "Ghim đề"},
  {id: "thong-bao", nhan: "Thông báo"},
  {id: "nhan-xet", nhan: "Nhận xét"},
  {id: "nguoi-dung", nhan: "Người dùng"}
] as const;
type TabId = (typeof TABS)[number]["id"];
const KHOA = "dethi.admin.tab";
const hopLe = (v: string): v is TabId => TABS.some((t) => t.id === v);
export default function AdminTabs() {
  const [tab, setTab] = useState<TabId>("tong-quan");
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hopLe(hash)) {
      setTab(hash);
      return;
    }
    try {
      const luu = localStorage.getItem(KHOA) ?? "";
      if (hopLe(luu)) setTab(luu);
    } catch {
      setTab("tong-quan");
    }
  }, []);
  useEffect(() => {
    const doi = () => {
      const hash = window.location.hash.replace("#", "");
      if (hopLe(hash)) setTab(hash);
    };
    window.addEventListener("hashchange", doi);
    return () => window.removeEventListener("hashchange", doi);
  }, []);
  const chon = (id: TabId) => {
    setTab(id);
    try {
      localStorage.setItem(KHOA, id);
    } catch {
      setTab(id);
    }
    window.history.replaceState(null, "", `#${id}`);
  };
  return (
    <div className="w-full min-w-0">
      <div className="sticky top-[66px] z-40 border-b border-ink/20 bg-paper">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex items-center gap-3 pt-3">
            <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
              <IconSeal className="h-3.5 w-3.5 text-accent" />
              Bàn quản trị
            </span>
            <span className="h-px flex-1 bg-ink/15" />
          </div>
          <div className="relative -mx-4 mt-1.5 px-4">
            <div className="no-scrollbar overflow-x-auto">
              <div className="flex w-max min-w-full items-stretch gap-1">
                {TABS.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button key={t.id} type="button" onClick={() => chon(t.id)} aria-current={active ? "page" : undefined} className={`nut-nhan relative shrink-0 whitespace-nowrap px-3 pb-2.5 pt-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${active ? "text-accent" : "text-ink-soft hover:text-ink"}`}>
                      {t.nhan}
                      {active && (
                        <motion.span layoutId="admin-tab-ink" transition={spring} className="absolute inset-x-1 -bottom-px text-accent">
                          <InkLine className="h-1.5 w-full" />
                        </motion.span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-paper to-transparent" />
          </div>
        </div>
      </div>
      <div className="[&>section]:mt-0">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -6}} transition={{duration: 0.22, ease: EASE}}>
            {tab === "tong-quan" && <Dashboard />}
            {tab === "de-pdf" && <AdminPanel />}
            {tab === "thi-online" && <ThiThuAdmin />}
            {tab === "ghim" && <GhimDe />}
            {tab === "thong-bao" && <ThongBaoAdmin />}
            {tab === "nhan-xet" && <BinhLuanAdmin />}
            {tab === "nguoi-dung" && <NguoiDungAdmin />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}