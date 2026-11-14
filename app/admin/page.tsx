"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconAlert, IconCheck, IconClose, IconEdit, IconExternal, IconFile, IconPlus, IconTrash, IconUpload } from "@/components/Icons";
import EmptyState from "@/components/EmptyState";
import { DS_DE, DS_MON, formatNgay, type DeThi, type Mon } from "@/lib/data";
import { buttonTap, EASE, fadeInUp, spring, staggerContainer } from "@/lib/animations";
export default function TrangAdmin() {
  const [danhSach, setDanhSach] = useState<DeThi[]>([...DS_DE]);
  const [mon, setMon] = useState<Mon>("Toán");
  const [ten, setTen] = useState("");
  const [urlPdf, setUrlPdf] = useState("");
  const [tenTep, setTenTep] = useState("");
  const [dangKeo, setDangKeo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thongBao, setThongBao] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const blobUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);
  useEffect(() => {
    if (!thongBao) return;
    const t = setTimeout(() => setThongBao(""), 3000);
    return () => clearTimeout(t);
  }, [thongBao]);
  const resetForm = () => {
    setMon("Toán");
    setTen("");
    setUrlPdf("");
    setTenTep("");
    setEditingId(null);
  };
  const chonTep = (f: File | null | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setThongBao("Chỉ nhận file PDF thôi nhé!");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setThongBao("File tối đa 20MB nhé!");
      return;
    }
    const url = URL.createObjectURL(f);
    blobUrls.current.push(url);
    setUrlPdf(url);
    setTenTep(f.name);
    setThongBao("");
  };
  const guiForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tenChuan = ten.trim();
    if (!tenChuan) {
      setThongBao("Nhập tên đề đã nhé!");
      return;
    }
    if (!urlPdf) {
      setThongBao("Chọn hoặc kéo thả file PDF vào khung!");
      return;
    }
    if (editingId) {
      const cu = danhSach.find((d) => d.id === editingId);
      if (cu && cu.urlPdf.startsWith("blob:") && cu.urlPdf !== urlPdf) URL.revokeObjectURL(cu.urlPdf);
      setDanhSach((ds) => ds.map((d) => (d.id === editingId ? { ...d, mon, ten: tenChuan, urlPdf } : d)));
      setThongBao("Đã cập nhật đề ✓");
    } else {
      const moi: DeThi = {
        id: `de-${Date.now()}`,
        mon,
        ten: tenChuan,
        ngay: new Date().toISOString().slice(0, 10),
        urlPdf,
      };
      setDanhSach((ds) => [moi, ...ds]);
      setThongBao("Đã thêm đề mới ✓");
    }
    resetForm();
  };
  const sua = (d: DeThi) => {
    setEditingId(d.id);
    setMon(d.mon);
    setTen(d.ten);
    setUrlPdf(d.urlPdf);
    setTenTep(d.urlPdf.startsWith("blob:") ? "PDF đã tải lên (giữ nguyên nếu không chọn file mới)" : "PDF mẫu trực tuyến");
    setThongBao("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const xoa = (id: string) => {
    const d = danhSach.find((x) => x.id === id);
    if (d && d.urlPdf.startsWith("blob:")) URL.revokeObjectURL(d.urlPdf);
    setDanhSach((ds) => ds.filter((x) => x.id !== id));
    if (editingId === id) resetForm();
    setThongBao("Đã xóa đề.");
  };
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-4 pb-16 pt-8 sm:pt-10">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full min-w-0">
        <motion.header variants={fadeInUp} className="w-full border-b-2 border-ink pb-5">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Trang <span className="text-accent">quản trị</span>
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Thêm, sửa, xóa đề thi trong kho.</p>
        </motion.header>
        <motion.div
          variants={fadeInUp}
          className="mt-4 flex w-full items-start gap-2.5 border border-accent/50 bg-accent-wash p-3.5 text-sm text-accent-deep"
        >
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Bản demo: dữ liệu chỉ lưu trong RAM trình duyệt, tải lại trang sẽ về danh sách mẫu. Muốn lưu vĩnh viễn thì nối database sau.</p>
        </motion.div>
        <div className="mt-6 grid w-full min-w-0 gap-6 lg:grid-cols-5">
          <motion.form
            ref={formRef}
            variants={fadeInUp}
            onSubmit={guiForm}
            className="h-fit min-w-0 scroll-mt-24 space-y-4 border border-ink/25 bg-paper-light p-5 shadow-paper lg:col-span-2"
          >
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              {editingId ? <IconEdit className="h-4 w-4 text-accent" /> : <IconUpload className="h-4 w-4 text-accent" />}
              {editingId ? "Sửa đề" : "Thêm đề mới"}
            </h2>
            <div>
              <label htmlFor="mon" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                Môn
              </label>
              <select
                id="mon"
                value={mon}
                onChange={(e) => setMon(e.target.value as Mon)}
                className="w-full border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
              >
                {DS_MON.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ten" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                Tên đề
              </label>
              <input
                id="ten"
                type="text"
                value={ten}
                onChange={(e) => setTen(e.target.value)}
                placeholder="VD: Đề thi thử THPT 2026 môn Toán - Lần 2"
                className="w-full border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
              />
            </div>
            <motion.label
              htmlFor="tep-pdf"
              whileHover={{ scale: 1.01 }}
              transition={spring}
              onDragOver={(e) => {
                e.preventDefault();
                setDangKeo(true);
              }}
              onDragLeave={() => setDangKeo(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDangKeo(false);
                chonTep(e.dataTransfer.files?.[0]);
              }}
              className={`block cursor-pointer border-2 border-dashed p-6 text-center transition-colors duration-300 ${
                dangKeo ? "border-accent bg-accent-wash shadow-stamp" : "border-ink/40 bg-paper hover:border-accent hover:shadow-stamp"
              }`}
            >
              <motion.div animate={dangKeo ? { scale: 1.06 } : { scale: 1 }} transition={spring} className="flex flex-col items-center gap-2">
                <span className="grid h-12 w-12 place-items-center border border-ink bg-ink text-paper-light">
                  <IconUpload className="h-5 w-5" />
                </span>
                {tenTep ? (
                  <span className="flex max-w-full items-center gap-1.5 text-sm font-semibold text-accent">
                    <IconFile className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tenTep}</span>
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-ink">Kéo thả PDF vào đây</span>
                )}
                <span className="text-xs text-ink-faint">hoặc bấm để chọn file · tối đa 20MB</span>
              </motion.div>
              <input
                id="tep-pdf"
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  chonTep(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </motion.label>
            <AnimatePresence>
              {thongBao && (
                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-medium text-accent">
                  {thongBao}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex gap-2.5">
              <motion.button
                whileTap={buttonTap}
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent"
              >
                {editingId ? <IconCheck className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
                {editingId ? "Cập nhật" : "Thêm đề"}
              </motion.button>
              {editingId && (
                <motion.button
                  whileTap={buttonTap}
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1.5 border border-ink/40 bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep"
                >
                  <IconClose className="h-4 w-4" />
                  Hủy
                </motion.button>
              )}
            </div>
          </motion.form>
          <motion.section variants={fadeInUp} className="min-w-0 lg:col-span-3">
            <h2 className="font-display text-lg font-bold text-ink">
              Danh sách đề <span className="text-ink-faint">({danhSach.length})</span>
            </h2>
            {danhSach.length === 0 ? (
              <div className="mt-4">
                <EmptyState tieuDe="Chưa có đề nào" moTa="Thêm đề đầu tiên bằng form bên cạnh nhé." />
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                <AnimatePresence>
                  {danhSach.map((d, i) => (
                    <motion.li
                      key={d.id}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24, transition: { duration: 0.2, ease: EASE } }}
                      transition={{ duration: 0.35, ease: EASE, delay: Math.min(i * 0.04, 0.4) }}
                      whileHover={{ x: 4, transition: { duration: 0.2, ease: EASE, delay: 0 } }}
                      className="sheet flex items-center gap-3 p-4 pl-8 shadow-paper"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center border border-ink/30 bg-paper text-ink">
                        <IconFile className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{d.ten}</p>
                        <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-ink-faint">
                          {d.mon} · {formatNgay(d.ngay)}
                        </p>
                      </div>
                      <motion.a
                        whileTap={buttonTap}
                        href={d.urlPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Mở PDF"
                        className="border border-transparent p-2 text-ink-faint transition-colors hover:border-ink/30 hover:text-ink"
                      >
                        <IconExternal className="h-4 w-4" />
                      </motion.a>
                      <motion.button
                        whileTap={buttonTap}
                        type="button"
                        onClick={() => sua(d)}
                        aria-label="Sửa đề"
                        className="border border-transparent p-2 text-ink transition-colors hover:border-accent hover:text-accent"
                      >
                        <IconEdit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileTap={buttonTap}
                        type="button"
                        onClick={() => xoa(d.id)}
                        aria-label="Xóa đề"
                        className="border border-transparent p-2 text-accent transition-colors hover:border-accent hover:bg-accent-wash"
                      >
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
    </div>
  );
}