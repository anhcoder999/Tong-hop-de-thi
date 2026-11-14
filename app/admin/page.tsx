"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Edit, ExternalLink, FileText, PlusCircle, Save, Trash2, Upload, X } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { DS_DE, DS_MON, formatNgay, type DeThi, type Mon } from "@/lib/data";
import { buttonTap, EASE, fadeInUp, spring, staggerContainer } from "@/lib/animations";
export default function TrangAdmin() {
  // Demo: toàn bộ dữ liệu nằm trong React state, tải lại trang sẽ về danh sách mẫu
  const [danhSach, setDanhSach] = useState<DeThi[]>([...DS_DE]);
  const [mon, setMon] = useState<Mon>("Toán");
  const [ten, setTen] = useState("");
  const [urlPdf, setUrlPdf] = useState("");
  const [tenTep, setTenTep] = useState("");
  const [dangKeo, setDangKeo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thongBao, setThongBao] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  // Gom các blob URL để thu hồi bộ nhớ khi rời trang, tránh rò rỉ RAM
  const blobUrls = useRef<string[]>([]);
  useEffect(() => {
    return () => blobUrls.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);
  // Thông báo tự tắt sau 3 giây cho gọn giao diện
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
  // Nhận file PDF: kiểm tra định dạng + dung lượng rồi tạo URL xem tạm trong trình duyệt
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
      // Thay PDF mới thì thu hồi blob cũ cho nhẹ bộ nhớ
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
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:pt-10">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.header variants={fadeInUp}>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Trang <span className="text-gradient">quản trị</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">Thêm, sửa, xóa đề thi trong kho.</p>
        </motion.header>
        <motion.div
          variants={fadeInUp}
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-sm text-amber-800"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>Bản demo: dữ liệu chỉ lưu trong RAM trình duyệt, tải lại trang sẽ về danh sách mẫu. Muốn lưu vĩnh viễn thì nối database sau.</p>
        </motion.div>
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <motion.form
            ref={formRef}
            variants={fadeInUp}
            onSubmit={guiForm}
            className="glass h-fit scroll-mt-24 space-y-4 rounded-xl p-5 shadow-soft lg:col-span-2"
          >
            <h2 className="flex items-center gap-2 text-base font-bold">
              {editingId ? <Edit size={17} className="text-brand-600" /> : <Upload size={17} className="text-brand-600" />}
              {editingId ? "Sửa đề" : "Thêm đề mới"}
            </h2>
            <div>
              <label htmlFor="mon" className="mb-1.5 block text-sm font-medium text-slate-600">
                Môn
              </label>
              <select
                id="mon"
                value={mon}
                onChange={(e) => setMon(e.target.value as Mon)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              >
                {DS_MON.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ten" className="mb-1.5 block text-sm font-medium text-slate-600">
                Tên đề
              </label>
              <input
                id="ten"
                type="text"
                value={ten}
                onChange={(e) => setTen(e.target.value)}
                placeholder="VD: Đề thi thử THPT 2026 môn Toán - Lần 2"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            {/* Vùng kéo thả PDF: viền glow khi hover hoặc đang kéo file vào */}
            <label
              htmlFor="tep-pdf"
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
              className={`block cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
                dangKeo
                  ? "border-brand-500 bg-brand-50/70 shadow-glow"
                  : "border-slate-300 bg-white/60 hover:border-brand-400 hover:shadow-glow"
              }`}
            >
              <motion.div animate={dangKeo ? { scale: 1.06 } : { scale: 1 }} transition={spring} className="flex flex-col items-center gap-2">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-lift">
                  <Upload size={20} />
                </span>
                {tenTep ? (
                  <span className="flex max-w-full items-center gap-1.5 text-sm font-semibold text-brand-700">
                    <FileText size={15} className="shrink-0" />
                    <span className="truncate">{tenTep}</span>
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-700">Kéo thả PDF vào đây</span>
                )}
                <span className="text-xs text-slate-400">hoặc bấm để chọn file - tối đa 20MB</span>
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
            </label>
            <AnimatePresence>
              {thongBao && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-brand-700"
                >
                  {thongBao}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex gap-2.5">
              <motion.button
                whileTap={buttonTap}
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-shadow hover:shadow-lift"
              >
                {editingId ? <Save size={16} /> : <PlusCircle size={16} />}
                {editingId ? "Cập nhật" : "Thêm đề"}
              </motion.button>
              {editingId && (
                <motion.button
                  whileTap={buttonTap}
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <X size={15} />
                  Hủy
                </motion.button>
              )}
            </div>
          </motion.form>
          <motion.section variants={fadeInUp} className="lg:col-span-3">
            <h2 className="text-base font-bold">
              Danh sách đề <span className="text-slate-400">({danhSach.length})</span>
            </h2>
            {danhSach.length === 0 ? (
              <div className="mt-4">
                <EmptyState tieuDe="Chưa có đề nào" moTa="Thêm đề đầu tiên bằng form bên cạnh nhé." />
              </div>
            ) : (
              <motion.ul layout className="mt-4 space-y-3">
                <AnimatePresence>
                  {danhSach.map((d) => (
                    // Mỗi item trượt từ trái vào, xóa thì trượt sang phải rồi biến mất
                    <motion.li
                      key={d.id}
                      layout
                      initial={{ opacity: 0, x: -32 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 32, transition: { duration: 0.2, ease: EASE } }}
                      transition={spring}
                      className="glass flex items-center gap-3 rounded-xl p-4 shadow-soft"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <FileText size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{d.ten}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {d.mon} · {formatNgay(d.ngay)}
                        </p>
                      </div>
                      <motion.a
                        whileTap={buttonTap}
                        href={d.urlPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Mở PDF"
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <ExternalLink size={16} />
                      </motion.a>
                      <motion.button
                        whileTap={buttonTap}
                        type="button"
                        onClick={() => sua(d)}
                        aria-label="Sửa đề"
                        className="rounded-lg p-2 text-brand-600 transition-colors hover:bg-brand-50"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        whileTap={buttonTap}
                        type="button"
                        onClick={() => xoa(d.id)}
                        aria-label="Xóa đề"
                        className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
  }
