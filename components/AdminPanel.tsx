"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconAlert, IconCheck, IconClose, IconDownload, IconEdit, IconExternal, IconEye, IconFile, IconLoader, IconPlus, IconRefresh, IconSearch, IconSeal, IconSort, IconTrash, IconUndo, IconUpload, MonIcon } from "@/components/Icons";
import EmptyState from "@/components/EmptyState";
import Skeleton from "@/components/Skeleton";
import { DS_MON, DS_TAB, formatDungLuong, formatNgay, homNay, khongDau, type DeThi, type Mon, type Tab } from "@/lib/data";
import { buttonTap, EASE, fadeInUp, spring, staggerContainer } from "@/lib/animations";
import { useHoverCapable } from "@/lib/useHover";
import { useAuth } from "@/lib/auth";
import { duoiFile, kiemTraTrung, layDanhSach, MAX_BYTES, suaDe, themDe, xoaDe } from "@/lib/deThi";
type SapXep = "moi" | "cu" | "ten";
type LocLoai = "all" | "pdf" | "docx";
const KHOA_VIEW = "dethi.admin.view";
export default function AdminPanel() {
  const { user, hoSo } = useAuth();
  const hover = useHoverCapable();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const undoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<DeThi[]>([]);
  const [ds, setDs] = useState<DeThi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loiTai, setLoiTai] = useState("");
  const [mon, setMon] = useState<Mon>("Toán");
  const [ten, setTen] = useState("");
  const [ngay, setNgay] = useState(homNay());
  const [tep, setTep] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dangKeo, setDangKeo] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [giaiDoan, setGiaiDoan] = useState("");
  const [bao, setBao] = useState<{ kieu: "ok" | "loi"; text: string } | null>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [locMon, setLocMon] = useState<Tab>("Tất cả");
  const [locLoai, setLocLoai] = useState<LocLoai>("all");
  const [sapXep, setSapXep] = useState<SapXep>("moi");
  const [chon, setChon] = useState<string[]>([]);
  const [choXoa, setChoXoa] = useState<DeThi[]>([]);
  const [chiTiet, setChiTiet] = useState<DeThi | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KHOA_VIEW);
      if (raw) {
        const v = JSON.parse(raw) as { locMon?: Tab; locLoai?: LocLoai; sapXep?: SapXep };
        if (v.locMon) setLocMon(v.locMon);
        if (v.locLoai) setLocLoai(v.locLoai);
        if (v.sapXep) setSapXep(v.sapXep);
      }
    } catch {
      setLocMon("Tất cả");
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KHOA_VIEW, JSON.stringify({ locMon, locLoai, sapXep }));
    } catch {
      setBao(null);
    }
  }, [locMon, locLoai, sapXep]);
  const tai = useCallback(async () => {
    setDangTai(true);
    setLoiTai("");
    try {
      setDs(await layDanhSach());
    } catch (e) {
      setLoiTai(e instanceof Error ? e.message : "Không tải được danh sách.");
    } finally {
      setDangTai(false);
    }
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  useEffect(() => {
    if (!bao) return;
    const t = setTimeout(() => setBao(null), bao.kieu === "loi" ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [bao]);
  const commitXoa = useCallback(async (items: DeThi[]) => {
    const thatBai: DeThi[] = [];
    for (const d of items) {
      try {
        await xoaDe(d);
      } catch {
        thatBai.push(d);
      }
    }
    if (thatBai.length) {
      setDs((cur) => [...thatBai, ...cur]);
      setBao({ kieu: "loi", text: `Không xóa được ${thatBai.length} đề. Đã hoàn lại danh sách.` });
    } else {
      setBao({ kieu: "ok", text: `Đã xóa vĩnh viễn ${items.length} đề và file trong kho ✓` });
    }
  }, []);
  useEffect(() => {
    return () => {
      if (undoRef.current) clearTimeout(undoRef.current);
      if (pendingRef.current.length) void commitXoa(pendingRef.current);
    };
  }, [commitXoa]);
  const resetForm = () => {
    setMon("Toán");
    setTen("");
    setNgay(homNay());
    setTep(null);
    setEditingId(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const chonTep = (f: File | null | undefined) => {
    if (!f) return;
    if (!duoiFile(f.name)) {
      setBao({ kieu: "loi", text: "Chỉ nhận file PDF hoặc DOCX." });
      return;
    }
    if (f.size > MAX_BYTES) {
      setBao({ kieu: "loi", text: "File vượt quá 20MB." });
      return;
    }
    setTep(f);
    setBao(null);
    if (!ten.trim()) setTen(f.name.replace(/\.(pdf|docx)$/i, "").replace(/[-_]+/g, " ").slice(0, 120));
  };
  const guiForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dangGui) return;
    const tenChuan = ten.trim();
    if (!tenChuan) {
      setBao({ kieu: "loi", text: "Nhập tên đề đã nhé." });
      return;
    }
    if (!editingId && !tep) {
      setBao({ kieu: "loi", text: "Chọn hoặc kéo thả file PDF/DOCX vào khung." });
      return;
    }
    setDangGui(true);
    setBao(null);
    try {
      setGiaiDoan("Đang kiểm tra trùng...");
      const trung = await kiemTraTrung(mon, tenChuan, editingId ?? undefined);
      if (trung) {
        setBao({ kieu: "loi", text: `Đã có đề tên này trong môn ${mon}. Đổi tên hoặc sửa đề cũ.` });
        return;
      }
      if (editingId) {
        const moi = await suaDe(editingId, { mon, ten: tenChuan, ngay }, tep, setGiaiDoan);
        setDs((cur) => cur.map((d) => (d.id === moi.id ? moi : d)));
        setBao({ kieu: "ok", text: "Đã cập nhật đề ✓" });
      } else {
        const moi = await themDe({ mon, ten: tenChuan, ngay }, tep as File, setGiaiDoan);
        setDs((cur) => [moi, ...cur]);
        setBao({ kieu: "ok", text: "Đã tải đề lên kho ✓" });
      }
      resetForm();
    } catch (err) {
      setBao({ kieu: "loi", text: err instanceof Error ? err.message : "Có lỗi khi lưu đề." });
    } finally {
      setDangGui(false);
      setGiaiDoan("");
    }
  };
  const sua = (d: DeThi) => {
    setEditingId(d.id);
    setMon(d.mon);
    setTen(d.ten);
    setNgay(d.ngay.slice(0, 10));
    setTep(null);
    setChiTiet(null);
    if (fileRef.current) fileRef.current.value = "";
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const yeuCauXoa = (items: DeThi[]) => {
    if (!items.length) return;
    if (undoRef.current) clearTimeout(undoRef.current);
    if (pendingRef.current.length) void commitXoa(pendingRef.current);
    pendingRef.current = items;
    setChoXoa(items);
    setDs((cur) => cur.filter((d) => !items.some((i) => i.id === d.id)));
    setChon([]);
    setChiTiet(null);
    if (editingId && items.some((i) => i.id === editingId)) resetForm();
    undoRef.current = setTimeout(() => {
      const list = pendingRef.current;
      pendingRef.current = [];
      setChoXoa([]);
      void commitXoa(list);
    }, 6000);
  };
  const hoanTac = () => {
    if (undoRef.current) clearTimeout(undoRef.current);
    const items = pendingRef.current;
    pendingRef.current = [];
    setChoXoa([]);
    setDs((cur) => [...items, ...cur]);
    setBao({ kieu: "ok", text: "Đã hoàn tác, đề vẫn còn trong kho." });
  };
  const hienThi = useMemo(() => {
    const tu = khongDau(tuKhoa);
    const loc = ds.filter(
      (d) => (locMon === "Tất cả" || d.mon === locMon) && (locLoai === "all" || d.loai === locLoai) && (!tu || khongDau(d.ten).includes(tu)),
    );
    if (sapXep === "moi") loc.sort((a, b) => b.ngay.localeCompare(a.ngay));
    if (sapXep === "cu") loc.sort((a, b) => a.ngay.localeCompare(b.ngay));
    if (sapXep === "ten") loc.sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
    return loc;
  }, [ds, tuKhoa, locMon, locLoai, sapXep]);
  const thongKe = useMemo(() => {
    const pdf = ds.filter((d) => d.loai === "pdf").length;
    const bytes = ds.reduce((s, d) => s + (d.kichThuoc ?? 0), 0);
    return { tong: ds.length, pdf, docx: ds.length - pdf, bytes };
  }, [ds]);
  const tatCaChon = hienThi.length > 0 && hienThi.every((d) => chon.includes(d.id));
  const doiChon = (id: string) => setChon((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const chonHet = () => setChon(tatCaChon ? [] : hienThi.map((d) => d.id));
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-4 pb-24 pt-8 sm:pt-10">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full min-w-0">
        <motion.header variants={fadeInUp} className="w-full border-b-2 border-ink pb-5">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Trang <span className="text-accent">quản trị</span>
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Tải đề PDF và DOCX lên kho lưu trữ. File được đặt tên ngẫu nhiên và xếp theo từng môn.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-ink-faint">
            <span className="flex items-center gap-1.5 border border-accent/70 px-2 py-0.5 text-accent">
              <IconSeal className="h-3.5 w-3.5" />
              Quản trị viên
            </span>
            <span className="max-w-[16rem] truncate">{hoSo?.ho_ten?.trim() || hoSo?.email || user?.email}</span>
          </div>
        </motion.header>
        <motion.div variants={fadeInUp} className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { nhan: "Tổng đề", giaTri: String(thongKe.tong) },
            { nhan: "File PDF", giaTri: String(thongKe.pdf) },
            { nhan: "File DOCX", giaTri: String(thongKe.docx) },
            { nhan: "Dung lượng", giaTri: formatDungLuong(thongKe.bytes) },
          ].map((s) => (
            <div key={s.nhan} className="border border-ink/25 bg-paper-light px-3 py-3 shadow-paper">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">{s.nhan}</p>
              <p className="mt-1 font-display text-xl font-bold text-ink">{dangTai ? "—" : s.giaTri}</p>
            </div>
          ))}
        </motion.div>
        <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.form ref={formRef} variants={fadeInUp} onSubmit={guiForm} className="h-fit min-w-0 scroll-mt-24 space-y-4 border border-ink/25 bg-paper-light p-5 shadow-paper lg:col-span-2">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              {editingId ? <IconEdit className="h-4 w-4 text-accent" /> : <IconUpload className="h-4 w-4 text-accent" />}
              {editingId ? "Sửa đề" : "Tải đề mới"}
            </h2>
            <div className="min-w-0">
              <label htmlFor="mon" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Môn</label>
              <select id="mon" value={mon} onChange={(e) => setMon(e.target.value as Mon)} className="w-full min-w-0 border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent">
                {DS_MON.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-ink-faint">File sẽ lưu vào thư mục của môn này trong kho.</p>
            </div>
            <div className="min-w-0">
              <label htmlFor="ten" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Tên đề</label>
              <input id="ten" type="text" value={ten} maxLength={160} onChange={(e) => setTen(e.target.value)} placeholder="VD: Đề thi thử tốt nghiệp 2026 môn Toán - Lần 1" className="w-full min-w-0 border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent" />
            </div>
            <div className="min-w-0">
              <label htmlFor="ngay" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Ngày đăng</label>
              <input id="ngay" type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="w-full min-w-0 border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent" />
            </div>
            <motion.label
              htmlFor="tep"
              whileHover={hover ? { scale: 1.01 } : undefined}
              transition={spring}
              onDragOver={(e) => { e.preventDefault(); setDangKeo(true); }}
              onDragLeave={() => setDangKeo(false)}
              onDrop={(e) => { e.preventDefault(); setDangKeo(false); chonTep(e.dataTransfer.files?.[0]); }}
              className={`block min-w-0 cursor-pointer border-2 border-dashed p-6 text-center transition-colors duration-300 ${dangKeo ? "border-accent bg-accent-wash shadow-stamp" : "border-ink/40 bg-paper hover:border-accent hover:shadow-stamp"}`}
            >
              <motion.div animate={dangKeo ? { scale: 1.06 } : { scale: 1 }} transition={spring} className="flex flex-col items-center gap-2">
                <span className="grid h-12 w-12 place-items-center border border-ink bg-ink text-paper-light">
                  <IconUpload className="h-5 w-5" />
                </span>
                {tep ? (
                  <span className="flex max-w-full flex-col items-center gap-1">
                    <span className="flex max-w-full items-center gap-1.5 text-sm font-semibold text-accent">
                      <IconFile className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tep.name}</span>
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">{formatDungLuong(tep.size)}</span>
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-ink">{editingId ? "Chọn file mới nếu muốn thay" : "Kéo thả PDF hoặc DOCX vào đây"}</span>
                )}
                <span className="text-xs text-ink-faint">hoặc bấm để chọn file · tối đa 20MB</span>
              </motion.div>
              <input ref={fileRef} id="tep" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={(e) => { chonTep(e.target.files?.[0]); e.target.value = ""; }} />
            </motion.label>
            {editingId && !tep && (
              <p className="border border-ink/25 bg-paper p-2.5 text-[11px] text-ink-soft">Giữ nguyên file cũ. Chỉ chọn file mới khi muốn thay nội dung đề.</p>
            )}
            <AnimatePresence>
              {dangGui && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-accent">
                    <IconLoader className="h-3.5 w-3.5 animate-spin" />
                    {giaiDoan || "Đang xử lý..."}
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden bg-ink/15">
                    <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} className="h-full w-1/2 bg-accent" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-2.5">
              <motion.button whileTap={buttonTap} type="submit" disabled={dangGui} className="flex flex-1 items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">
                {dangGui ? <IconLoader className="h-4 w-4 animate-spin" /> : editingId ? <IconCheck className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
                {dangGui ? "Đang lưu" : editingId ? "Cập nhật" : "Tải lên kho"}
              </motion.button>
              {editingId && (
                <motion.button whileTap={buttonTap} type="button" onClick={resetForm} className="flex items-center gap-1.5 border border-ink/40 bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors active:bg-paper-deep hover:bg-paper-deep">
                  <IconClose className="h-4 w-4" />
                  Hủy
                </motion.button>
              )}
            </div>
          </motion.form>
          <motion.section variants={fadeInUp} className="min-w-0 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-ink">
                Kho đề <span className="text-ink-faint">({hienThi.length}/{ds.length})</span>
              </h2>
              <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} className="flex items-center gap-1.5 border border-ink/30 bg-paper-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors active:bg-accent-wash hover:border-accent hover:text-accent">
                <IconRefresh className={`h-3.5 w-3.5 ${dangTai ? "animate-spin" : ""}`} />
                Tải lại
              </motion.button>
            </div>
            <div className="mt-3 space-y-2.5">
              <div className="group relative">
                <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-accent" />
                <input type="text" value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} placeholder="Tìm trong kho đề..." aria-label="Tìm trong kho đề" className="w-full border border-ink/30 bg-paper py-2.5 pl-9 pr-8 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent" />
                {tuKhoa && (
                  <button type="button" onClick={() => setTuKhoa("")} aria-label="Xóa từ khóa" className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-accent">
                    <IconClose className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <select value={locMon} onChange={(e) => setLocMon(e.target.value as Tab)} aria-label="Lọc theo môn" className="min-w-0 border border-ink/30 bg-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft outline-none focus:border-accent">
                  {DS_TAB.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select value={locLoai} onChange={(e) => setLocLoai(e.target.value as LocLoai)} aria-label="Lọc theo loại file" className="min-w-0 border border-ink/30 bg-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft outline-none focus:border-accent">
                  <option value="all">Mọi loại file</option>
                  <option value="pdf">Chỉ PDF</option>
                  <option value="docx">Chỉ DOCX</option>
                </select>
                <div className="flex items-center gap-2">
                  <IconSort className="h-4 w-4 shrink-0 text-ink-faint" />
                  <select value={sapXep} onChange={(e) => setSapXep(e.target.value as SapXep)} aria-label="Sắp xếp" className="min-w-0 flex-1 border border-ink/30 bg-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft outline-none focus:border-accent">
                    <option value="moi">Mới nhất</option>
                    <option value="cu">Cũ nhất</option>
                    <option value="ten">Theo tên</option>
                  </select>
                </div>
              </div>
              {hienThi.length > 0 && (
                <button type="button" onClick={chonHet} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-accent">
                  <span className={`grid h-4 w-4 place-items-center border ${tatCaChon ? "border-accent bg-accent text-paper-light" : "border-ink/40"}`}>
                    {tatCaChon && <IconCheck className="h-3 w-3" />}
                  </span>
                  {tatCaChon ? "Bỏ chọn tất cả" : `Chọn tất cả ${hienThi.length} đề`}
                </button>
              )}
            </div>
            {loiTai ? (
              <div className="mt-4 border border-accent/50 bg-accent-wash p-4 text-sm text-accent-deep">
                <p className="font-semibold">Không tải được kho đề</p>
                <p className="mt-1 text-xs">{loiTai}</p>
              </div>
            ) : dangTai ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : ds.length === 0 ? (
              <div className="mt-4">
                <EmptyState kieu="kho" tieuDe="Kho chưa có đề nào" moTa="Dùng form bên cạnh để tải đề đầu tiên. File sẽ lưu vĩnh viễn trên kho, không mất khi tải lại trang." />
              </div>
            ) : hienThi.length === 0 ? (
              <div className="mt-4">
                <EmptyState onReset={() => { setTuKhoa(""); setLocMon("Tất cả"); setLocLoai("all"); }} />
              </div>
            ) : (
              <ul className="mt-4 min-w-0 space-y-3">
                <AnimatePresence initial={false}>
                  {hienThi.map((d, i) => (
                    <motion.li
                      key={d.id}
                      layout="position"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24, transition: { duration: 0.2, ease: EASE } }}
                      transition={{ duration: 0.3, ease: EASE, delay: Math.min(i * 0.03, 0.3) }}
                      className={`sheet flex min-w-0 items-center gap-3 p-4 pl-8 shadow-paper transition-colors ${chon.includes(d.id) ? "border-accent/70 bg-accent-wash/40" : ""}`}
                    >
                      <button type="button" onClick={() => doiChon(d.id)} aria-label="Chọn đề" className={`grid h-5 w-5 shrink-0 place-items-center border transition-colors ${chon.includes(d.id) ? "border-accent bg-accent text-paper-light" : "border-ink/40 text-transparent hover:border-accent"}`}>
                        <IconCheck className="h-3 w-3" />
                      </button>
                      <span className="grid h-10 w-10 shrink-0 place-items-center border border-ink/30 bg-paper text-ink">
                        <MonIcon mon={d.mon} className="h-5 w-5" />
                      </span>
                      <button type="button" onClick={() => setChiTiet(d)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-semibold text-ink">{d.ten}</p>
                        <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                          {d.mon} · {formatNgay(d.ngay)} · {d.loai === "docx" ? "DOCX" : "PDF"} · {formatDungLuong(d.kichThuoc)}
                        </p>
                      </button>
                      <Link href={`/de/${d.id}`} aria-label="Xem đề" className="shrink-0 border border-transparent p-2 text-ink-faint transition-colors hover:border-ink/30 hover:text-ink">
                        <IconEye className="h-4 w-4" />
                      </Link>
                      <motion.button whileTap={buttonTap} type="button" onClick={() => sua(d)} aria-label="Sửa đề" className="shrink-0 border border-transparent p-2 text-ink transition-colors hover:border-accent hover:text-accent">
                        <IconEdit className="h-4 w-4" />
                      </motion.button>
                      <motion.button whileTap={buttonTap} type="button" onClick={() => yeuCauXoa([d])} aria-label="Xóa đề" className="shrink-0 border border-transparent p-2 text-accent transition-colors hover:border-accent hover:bg-accent-wash">
                        <IconTrash className="h-4 w-4" />
                      </motion.button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </motion.section>
        </div>
      </motion.div>
      <AnimatePresence>
        {bao && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-lg items-start gap-2.5 border p-3.5 text-sm shadow-lift ${bao.kieu === "loi" ? "border-accent bg-accent-wash text-accent-deep" : "border-ink bg-ink text-paper-light"}`}>
            {bao.kieu === "loi" ? <IconAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <IconCheck className="mt-0.5 h-4 w-4 shrink-0" />}
            <p className="min-w-0 flex-1">{bao.text}</p>
            <button type="button" onClick={() => setBao(null)} aria-label="Đóng thông báo" className="shrink-0 opacity-70 transition-opacity hover:opacity-100">
              <IconClose className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {chon.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="fixed inset-x-4 bottom-20 z-[55] mx-auto flex max-w-lg items-center gap-3 border border-ink bg-paper-light p-3 shadow-lift">
            <span className="grid h-8 w-8 shrink-0 place-items-center border border-accent bg-accent-wash font-display text-sm font-bold text-accent">{chon.length}</span>
            <p className="min-w-0 flex-1 text-xs uppercase tracking-[0.1em] text-ink-soft">đề đang chọn</p>
            <motion.button whileTap={buttonTap} type="button" onClick={() => setChon([])} className="border border-ink/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-paper-deep">
              Bỏ chọn
            </motion.button>
            <motion.button whileTap={buttonTap} type="button" onClick={() => yeuCauXoa(ds.filter((d) => chon.includes(d.id)))} className="flex items-center gap-1.5 border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:bg-accent-deep">
              <IconTrash className="h-3.5 w-3.5" />
              Xóa
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {choXoa.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-lg border-2 border-accent bg-paper-light shadow-lift">
            <div className="flex items-center gap-3 p-3.5">
              <IconTrash className="h-4 w-4 shrink-0 text-accent" />
              <p className="min-w-0 flex-1 text-sm text-ink">
                Đang chờ xóa <b>{choXoa.length}</b> đề và file trong kho.
              </p>
              <motion.button whileTap={buttonTap} type="button" onClick={hoanTac} className="flex shrink-0 items-center gap-1.5 border border-ink bg-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:border-accent hover:bg-accent">
                <IconUndo className="h-3.5 w-3.5" />
                Hoàn tác
              </motion.button>
            </div>
            <motion.div initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 6, ease: "linear" }} className="h-1 origin-left bg-accent" />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {chiTiet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChiTiet(null)} className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-sm" />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={spring} className="viewer-scroll fixed right-0 top-0 z-[81] flex h-full w-full max-w-md flex-col overflow-y-auto border-l-2 border-ink bg-paper shadow-lift">
              <div className="flex items-start justify-between gap-3 border-b-2 border-ink p-5">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">Chi tiết đề</p>
                  <h3 className="mt-1 font-display text-xl font-bold leading-snug text-ink">{chiTiet.ten}</h3>
                </div>
                <button type="button" onClick={() => setChiTiet(null)} aria-label="Đóng" className="shrink-0 border border-ink/40 p-2 text-ink-soft transition-colors hover:border-accent hover:text-accent">
                  <IconClose className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center border-2 border-ink bg-paper-light text-accent shadow-stamp">
                    <MonIcon mon={chiTiet.mon} className="h-7 w-7" />
                  </span>
                  <div className="min-w-0">
                    <span className="inline-block -rotate-2 border border-accent/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{chiTiet.mon}</span>
                    <p className="mt-1.5 text-xs uppercase tracking-[0.12em] text-ink-faint">{chiTiet.loai === "docx" ? "Tài liệu Word" : "Tài liệu PDF"}</p>
                  </div>
                </div>
                <dl className="border-t border-dashed border-ink/25">
                  {[
                    { nhan: "Ngày đăng", giaTri: formatNgay(chiTiet.ngay) },
                    { nhan: "Dung lượng", giaTri: formatDungLuong(chiTiet.kichThuoc) },
                    { nhan: "Tên file gốc", giaTri: chiTiet.tenGoc ?? "—" },
                    { nhan: "Đường dẫn kho", giaTri: chiTiet.duongDan ?? "—" },
                  ].map((r) => (
                    <div key={r.nhan} className="flex items-start justify-between gap-3 border-b border-dashed border-ink/20 py-2.5">
                      <dt className="shrink-0 text-xs uppercase tracking-[0.12em] text-ink-faint">{r.nhan}</dt>
                      <dd className="min-w-0 break-all text-right text-sm font-semibold text-ink">{r.giaTri}</dd>
                    </div>
                  ))}
                </dl>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link href={`/de/${chiTiet.id}`}>
                    <motion.span whileTap={buttonTap} className="flex items-center justify-center gap-2 border border-ink bg-ink px-3 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
                      <IconEye className="h-4 w-4" />
                      Xem đề
                    </motion.span>
                  </Link>
                  <motion.a whileTap={buttonTap} href={chiTiet.urlPdf} download={`${chiTiet.ten}.${chiTiet.loai}`} className="flex items-center justify-center gap-2 border border-ink bg-paper-light px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper">
                    <IconDownload className="h-4 w-4" />
                    Tải file
                  </motion.a>
                  <motion.a whileTap={buttonTap} href={chiTiet.urlPdf} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-ink/40 bg-paper px-3 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep">
                    <IconExternal className="h-4 w-4" />
                    Mở kho
                  </motion.a>
                  <motion.button whileTap={buttonTap} type="button" onClick={() => sua(chiTiet)} className="flex items-center justify-center gap-2 border border-accent bg-accent-wash px-3 py-2.5 text-sm font-semibold text-accent-deep transition-colors hover:bg-accent hover:text-paper-light">
                    <IconEdit className="h-4 w-4" />
                    Sửa đề
                  </motion.button>
                </div>
                <motion.button whileTap={buttonTap} type="button" onClick={() => yeuCauXoa([chiTiet])} className="flex w-full items-center justify-center gap-2 border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:bg-accent-deep">
                  <IconTrash className="h-4 w-4" />
                  Xóa đề và file
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}