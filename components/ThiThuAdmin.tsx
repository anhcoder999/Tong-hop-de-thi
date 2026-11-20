"use client";
import {useCallback, useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {IconAlert, IconCheck, IconClose, IconEdit, IconEye, IconLoader, IconPlus, IconRefresh, IconSeal, IconTrash} from "@/components/Icons";
import Latex from "@/components/Latex";
import {capNhatDeOnline, congKhaiDeOnline, layCauHoiAdmin, layDeOnlineAdmin, luuCauHoi, taoDeOnline, xoaCauHoi, xoaDeOnline} from "@/app/thi-thu/actions";
import {DS_MON, MON_DAY_DU} from "@/lib/data";
import {KY_HIEU_DS, KY_HIEU_MCQ, nhanLoai, type CauHoiDayDu, type DeThiOnline, type LoaiCau, type LuaChon} from "@/lib/thiThu";
import {buttonTap, fadeInUp} from "@/lib/animations";
type FormDe = {mon: string; ten: string; mo_ta: string; thoi_gian_phut: number};
type FormCau = {id?: string; thu_tu: number; loai: LoaiCau; noi_dung: string; diem: number; lua_chon: LuaChon[]; dap_an_mcq: string; dap_an_ds: Record<string, boolean>; dap_an_ngan: string; giai_thich: string};
type NutCongThuc = {nhan: string; than: string; block?: boolean};
const KHUNG: NutCongThuc[] = [
  {nhan: "Công thức", than: "@@|"},
  {nhan: "Dòng riêng", than: "@@|", block: true},
  {nhan: "a/b", than: "\\frac{@@}{|}"},
  {nhan: "Mũ", than: "@@^{|}"},
  {nhan: "Chỉ số", than: "@@_{|}"},
  {nhan: "Căn", than: "\\sqrt{@@|}"},
  {nhan: "Tích phân", than: "\\int_{|}^{}"},
  {nhan: "Tổng", than: "\\sum_{|}^{}"},
  {nhan: "Vector", than: "\\overrightarrow{@@|}"},
  {nhan: "Giới hạn", than: "\\lim_{|}"}
];
const KY_HIEU: NutCongThuc[] = [
  {nhan: "≤", than: "\\le "},
  {nhan: "≥", than: "\\ge "},
  {nhan: "≠", than: "\\ne "},
  {nhan: "±", than: "\\pm "},
  {nhan: "×", than: "\\times "},
  {nhan: "·", than: "\\cdot "},
  {nhan: "∞", than: "\\infty "},
  {nhan: "Độ", than: "^\\circ "},
  {nhan: "π", than: "\\pi "},
  {nhan: "α", than: "\\alpha "},
  {nhan: "β", than: "\\beta "},
  {nhan: "Δ", than: "\\Delta "},
  {nhan: "→", than: "\\to "},
  {nhan: "⇔", than: "\\Leftrightarrow "},
  {nhan: "∈", than: "\\in "},
  {nhan: "⊥", than: "\\perp "}
];
const GON: NutCongThuc[] = [KHUNG[0], KHUNG[2], KHUNG[3], KHUNG[5], KY_HIEU[0], KY_HIEU[8]];
const deRong: FormDe = {mon: "Toán", ten: "", mo_ta: "", thoi_gian_phut: 50};
const cauRong = (thuTu: number): FormCau => ({thu_tu: thuTu, loai: "trac_nghiem", noi_dung: "", diem: 1, lua_chon: KY_HIEU_MCQ.map((k) => ({ky_hieu: k, noi_dung: ""})), dap_an_mcq: "", dap_an_ds: {}, dap_an_ngan: "", giai_thich: ""});
function chenCongThuc(el: HTMLTextAreaElement | null, giaTri: string, dat: (v: string) => void, than: string, block?: boolean) {
  const a = el?.selectionStart ?? giaTri.length;
  const b = el?.selectionEnd ?? giaTri.length;
  const chon = giaTri.slice(a, b);
  let noi = than.replace("@@", chon);
  const dau = noi.indexOf("|");
  if (dau >= 0) noi = noi.slice(0, dau) + noi.slice(dau + 1);
  let dem = 0;
  for (let i = 0; i < a; i++) if (giaTri[i] === "$" && giaTri[i - 1] !== "\\") dem++;
  const trong = !block && dem % 2 === 1;
  const boc = block ? `\n$$${noi}$$\n` : trong ? noi : `$${noi}$ `;
  dat(giaTri.slice(0, a) + boc + giaTri.slice(b));
  const offset = (block ? 3 : trong ? 0 : 1) + (dau >= 0 ? dau : noi.length);
  requestAnimationFrame(() => {
    if (!el) return;
    el.focus();
    el.setSelectionRange(a + offset, a + offset);
  });
}
function OSoan({nhan, giaTri, dat, rows = 3, placeholder, gon, hienXem, goiY}: {nhan?: string; giaTri: string; dat: (v: string) => void; rows?: number; placeholder?: string; gon?: boolean; hienXem?: boolean; goiY?: string}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const ds = gon ? GON : [...KHUNG, ...KY_HIEU];
  return (
    <div>
      {nhan && <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{nhan}</label>}
      <div className="mb-1 flex flex-wrap gap-1">
        {ds.map((n) => (
          <button key={n.nhan} type="button" onClick={() => chenCongThuc(ref.current, giaTri, dat, n.than, n.block)} className="border border-ink/25 bg-paper px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent">
            {n.nhan}
          </button>
        ))}
      </div>
      <textarea ref={ref} value={giaTri} onChange={(e) => dat(e.target.value)} rows={rows} placeholder={placeholder} className="w-full border border-ink/30 bg-paper-light px-3 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
      {goiY && <p className="mt-1 text-[10px] leading-relaxed text-ink-faint">{goiY}</p>}
      {hienXem && giaTri.trim() !== "" && (
        <div className="mt-1.5 border border-dashed border-ink/25 bg-paper p-2.5 text-sm leading-relaxed text-ink">
          <Latex nguon={giaTri} />
        </div>
      )}
    </div>
  );
}
export default function ThiThuAdmin() {
  const [ds, setDs] = useState<DeThiOnline[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [bao, setBao] = useState<{kieu: "ok" | "loi"; text: string} | null>(null);
  const [deForm, setDeForm] = useState<FormDe>(deRong);
  const [deSua, setDeSua] = useState<string | null>(null);
  const [dangLuuDe, setDangLuuDe] = useState(false);
  const [deChon, setDeChon] = useState<string | null>(null);
  const [cau, setCau] = useState<CauHoiDayDu[]>([]);
  const [dangTaiCau, setDangTaiCau] = useState(false);
  const [cauForm, setCauForm] = useState<FormCau>(cauRong(1));
  const [dangLuuCau, setDangLuuCau] = useState(false);
  const [xemTruoc, setXemTruoc] = useState(false);
  const [moFormDe, setMoFormDe] = useState(false);
  const tai = useCallback(async () => {
    setDangTai(true);
    const kq = await layDeOnlineAdmin();
    if (kq.ok) setDs(kq.ds);
    else setBao({kieu: "loi", text: kq.error});
    setDangTai(false);
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  useEffect(() => {
    if (!bao) return;
    const t = setTimeout(() => setBao(null), 5000);
    return () => clearTimeout(t);
  }, [bao]);
  const taiCau = useCallback(async (deId: string) => {
    setDangTaiCau(true);
    const kq = await layCauHoiAdmin(deId);
    if (kq.ok) {
      setCau(kq.ds);
      setCauForm((cur) => (cur.id ? cur : cauRong(kq.ds.length + 1)));
    } else setBao({kieu: "loi", text: kq.error});
    setDangTaiCau(false);
  }, []);
  const chonDe = (id: string) => {
    setDeChon(id);
    setCauForm(cauRong(1));
    void taiCau(id);
  };
  const luuDe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dangLuuDe) return;
    setDangLuuDe(true);
    const kq = deSua ? await capNhatDeOnline(deSua, deForm) : await taoDeOnline(deForm);
    if (kq.ok) {
      setBao({kieu: "ok", text: deSua ? "Đã cập nhật đề." : "Đã tạo đề. Giờ nhập câu hỏi bên dưới."});
      setDeForm(deRong);
      setDeSua(null);
      setMoFormDe(false);
      await tai();
    } else setBao({kieu: "loi", text: kq.error ?? "Lỗi lưu đề."});
    setDangLuuDe(false);
  };
  const doiCongKhai = async (d: DeThiOnline) => {
    const kq = await congKhaiDeOnline(d.id, !d.cong_khai);
    setBao(kq.ok ? {kieu: "ok", text: d.cong_khai ? "Đã ẩn đề." : "Đã công khai đề, member thấy trong phòng thi."} : {kieu: "loi", text: kq.error ?? "Lỗi."});
    await tai();
  };
  const xoaDe = async (d: DeThiOnline) => {
    if (!window.confirm(`Xóa đề "${d.ten}" cùng toàn bộ câu hỏi và bài thi?`)) return;
    const kq = await xoaDeOnline(d.id);
    setBao(kq.ok ? {kieu: "ok", text: "Đã xóa đề."} : {kieu: "loi", text: kq.error ?? "Lỗi."});
    if (deChon === d.id) {
      setDeChon(null);
      setCau([]);
    }
    await tai();
  };
  const doiLoai = (loai: LoaiCau) => setCauForm((c) => ({...c, loai, lua_chon: (loai === "dung_sai" ? KY_HIEU_DS : KY_HIEU_MCQ).map((k) => ({ky_hieu: k, noi_dung: c.lua_chon.find((x) => x.ky_hieu === k)?.noi_dung ?? ""})), dap_an_mcq: loai === "trac_nghiem" ? c.dap_an_mcq : "", dap_an_ds: loai === "dung_sai" ? c.dap_an_ds : {}}));
  const doiLuaChon = (ky: string, text: string) => setCauForm((c) => ({...c, lua_chon: c.lua_chon.map((x) => (x.ky_hieu === ky ? {...x, noi_dung: text} : x))}));
  const luuCau = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deChon || dangLuuCau) return;
    setDangLuuCau(true);
    const kq = await luuCauHoi({...cauForm, de_id: deChon});
    if (kq.ok) {
      setBao({kieu: "ok", text: cauForm.id ? "Đã cập nhật câu hỏi." : "Đã thêm câu hỏi."});
      const kq2 = await layCauHoiAdmin(deChon);
      if (kq2.ok) {
        setCau(kq2.ds);
        setCauForm(cauRong(kq2.ds.length + 1));
      }
      await tai();
    } else setBao({kieu: "loi", text: kq.error ?? "Lỗi lưu câu."});
    setDangLuuCau(false);
  };
  const suaCau = (c: CauHoiDayDu) => setCauForm({id: c.id, thu_tu: c.thu_tu, loai: c.loai, noi_dung: c.noi_dung, diem: c.diem, lua_chon: c.lua_chon, dap_an_mcq: c.dap_an_mcq, dap_an_ds: c.dap_an_ds, dap_an_ngan: c.dap_an_ngan, giai_thich: c.giai_thich});
  const xoaCau = async (c: CauHoiDayDu) => {
    if (!window.confirm(`Xóa câu ${c.thu_tu}?`)) return;
    const kq = await xoaCauHoi(c.id);
    setBao(kq.ok ? {kieu: "ok", text: "Đã xóa câu."} : {kieu: "loi", text: kq.error ?? "Lỗi."});
    if (deChon) await taiCau(deChon);
    await tai();
  };
  const deDangChon = ds.find((d) => d.id === deChon) ?? null;
  const kyHieuDangDung = cauForm.loai === "dung_sai" ? KY_HIEU_DS : KY_HIEU_MCQ;
  return (
    <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto mt-0 w-full min-w-0 max-w-6xl px-4 pb-16 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink">
            <IconSeal className="h-4 w-4 text-accent" />
            Đề thi online
          </h1>
          <p className="mt-1 text-xs text-ink-soft">Gõ chữ thường, chỉ bọc công thức trong $…$ hoặc bôi đen rồi bấm nút chèn.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="border border-ink/25 bg-paper-light px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ink-faint">Tổng <b className="font-mono text-ink">{ds.length}</b></span>
          <motion.button whileTap={buttonTap} type="button" onClick={() => {
            setMoFormDe((v) => !v);
            setDeSua(null);
            setDeForm(deRong);
          }} className="nut-nhan flex items-center gap-1.5 border border-ink bg-ink px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:border-accent hover:bg-accent">
            {moFormDe ? <IconClose className="h-3 w-3" /> : <IconPlus className="h-3 w-3" />}
            {moFormDe ? "Đóng form" : "Tạo đề"}
          </motion.button>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} aria-label="Tải lại" className="border border-ink/30 bg-paper-light p-1.5 text-ink-soft transition-colors hover:border-accent hover:text-accent">
            <IconRefresh className={`h-3.5 w-3.5 ${dangTai ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {bao && (
          <motion.p initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className={`mt-3 border p-2.5 text-xs ${bao.kieu === "loi" ? "border-danger/60 bg-danger/10 text-danger" : "border-ok/60 bg-ok/10 text-ok"}`}>{bao.text}</motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {(moFormDe || deSua) && (
          <motion.form initial={{height: 0, opacity: 0}} animate={{height: "auto", opacity: 1}} exit={{height: 0, opacity: 0}} onSubmit={luuDe} className="overflow-hidden">
            <div className="mt-3 grid grid-cols-1 gap-2 border border-ink/25 bg-paper-light p-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Môn</label>
                <select value={deForm.mon} onChange={(e) => setDeForm((f) => ({...f, mon: e.target.value}))} className="w-full border border-ink/30 bg-paper px-2 py-2 text-sm text-ink outline-none focus:border-accent">
                  {DS_MON.map((m) => <option key={m} value={m}>{m} · {MON_DAY_DU[m]}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Phút</label>
                <input type="number" min={5} max={180} value={deForm.thoi_gian_phut} onChange={(e) => setDeForm((f) => ({...f, thoi_gian_phut: Number(e.target.value)}))} className="w-full border border-ink/30 bg-paper px-2 py-2 text-sm text-ink outline-none focus:border-accent" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Tên đề</label>
                <input type="text" value={deForm.ten} maxLength={160} onChange={(e) => setDeForm((f) => ({...f, ten: e.target.value}))} placeholder="VD: Đề thi thử tốt nghiệp 2026 - Lần 1" className="w-full border border-ink/30 bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Mô tả ngắn</label>
                <input type="text" value={deForm.mo_ta} maxLength={240} onChange={(e) => setDeForm((f) => ({...f, mo_ta: e.target.value}))} placeholder="VD: 12 trắc nghiệm, 4 đúng sai, 6 trả lời ngắn" className="w-full border border-ink/30 bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
              </div>
              <div className="flex items-end gap-1.5">
                <motion.button whileTap={buttonTap} type="submit" disabled={dangLuuDe} className="nut-nhan flex flex-1 items-center justify-center gap-1.5 border border-ink bg-ink px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-60">
                  {dangLuuDe ? <IconLoader className="h-3 w-3 animate-spin" /> : deSua ? <IconCheck className="h-3 w-3" /> : <IconPlus className="h-3 w-3" />}
                  {deSua ? "Cập nhật" : "Tạo"}
                </motion.button>
                {deSua && (
                  <motion.button whileTap={buttonTap} type="button" onClick={() => {
                    setDeSua(null);
                    setDeForm(deRong);
                  }} aria-label="Hủy sửa" className="border border-ink/40 bg-paper p-2 text-ink-soft transition-colors hover:border-accent hover:text-accent">
                    <IconClose className="h-3 w-3" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <div className="mt-3 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Bộ đề</p>
          <div className="viewer-scroll mt-1.5 max-h-[62vh] min-h-[10rem] overflow-y-auto border border-ink/15 bg-paper/40 p-2">
            <ul className="space-y-1.5">
              {ds.map((d) => (
                <li key={d.id} className={`border p-2.5 transition-colors ${deChon === d.id ? "border-accent bg-accent-wash/40" : "border-ink/20 bg-paper-light"}`}>
                  <button type="button" onClick={() => chonDe(d.id)} className="w-full text-left">
                    <p className="truncate text-xs font-semibold text-ink">{d.ten}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] uppercase tracking-[0.08em] text-ink-faint">
                      <span className="font-semibold text-accent">{d.mon}</span>
                      <span className="font-mono">{d.so_cau} câu</span>
                      <span className="font-mono">{d.thoi_gian_phut}p</span>
                      <span className={`border px-1 font-bold ${d.cong_khai ? "border-ok text-ok" : "border-warn text-warn"}`}>{d.cong_khai ? "Công khai" : "Nháp"}</span>
                    </p>
                  </button>
                  <div className="mt-1.5 flex items-center gap-1 border-t border-dashed border-ink/15 pt-1.5">
                    <motion.button whileTap={buttonTap} type="button" onClick={() => {
                      setDeSua(d.id);
                      setMoFormDe(true);
                      setDeForm({mon: d.mon, ten: d.ten, mo_ta: d.mo_ta, thoi_gian_phut: d.thoi_gian_phut});
                    }} className="flex items-center gap-1 border border-ink/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
                      <IconEdit className="h-3 w-3" />
                      Sửa
                    </motion.button>
                    <motion.button whileTap={buttonTap} type="button" onClick={() => void doiCongKhai(d)} className="flex items-center gap-1 border border-ink/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft transition-colors hover:border-ok hover:text-ok">
                      {d.cong_khai ? <IconClose className="h-3 w-3" /> : <IconEye className="h-3 w-3" />}
                      {d.cong_khai ? "Ẩn" : "Công khai"}
                    </motion.button>
                    <motion.button whileTap={buttonTap} type="button" onClick={() => void xoaDe(d)} aria-label="Xóa đề" className="ml-auto border border-transparent p-1 text-accent transition-colors hover:border-accent">
                      <IconTrash className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </li>
              ))}
              {!dangTai && ds.length === 0 && <li className="p-2 text-xs text-ink-soft">Chưa có đề online nào. Bấm “Tạo đề” ở trên.</li>}
            </ul>
          </div>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-faint">Khung cuộn riêng · {ds.length} bộ đề</p>
        </div>
        <div className="min-w-0 lg:col-span-3">
          {!deDangChon ? (
            <div className="grid h-full min-h-[12rem] place-items-center border border-dashed border-ink/25 bg-paper-light p-6 text-center">
              <p className="max-w-xs text-sm text-ink-soft">Chọn một bộ đề ở khung bên trái để soạn câu hỏi cho đề đó.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Câu hỏi · <span className="text-accent">{deDangChon.ten}</span></p>
                <span className="font-mono text-[10px] text-ink-faint">{cau.length} câu</span>
              </div>
              {dangTaiCau ? (
                <p className="mt-2 flex items-center gap-2 text-xs text-ink-faint"><IconLoader className="h-3.5 w-3.5 animate-spin text-accent" />Đang tải câu hỏi...</p>
              ) : (
                <div className="viewer-scroll mt-1.5 max-h-[34vh] min-h-[6rem] overflow-y-auto border border-ink/15 bg-paper/40 p-2">
                  <ul className="space-y-1.5">
                    {cau.map((c) => (
                      <li key={c.id} className="flex min-w-0 items-start gap-2 border border-ink/20 bg-paper-light p-2">
                        <span className="grid h-6 w-6 shrink-0 place-items-center border border-ink/30 font-mono text-[10px] font-bold text-ink">{c.thu_tu}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] uppercase tracking-[0.12em] text-ink-faint">{nhanLoai(c.loai)} · {c.diem}đ</p>
                          <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-soft"><Latex nguon={c.noi_dung} /></div>
                        </div>
                        <motion.button whileTap={buttonTap} type="button" onClick={() => suaCau(c)} aria-label="Sửa câu" className="shrink-0 p-1 text-ink transition-colors hover:text-accent"><IconEdit className="h-3.5 w-3.5" /></motion.button>
                        <motion.button whileTap={buttonTap} type="button" onClick={() => void xoaCau(c)} aria-label="Xóa câu" className="shrink-0 p-1 text-accent transition-colors hover:text-accent-deep"><IconTrash className="h-3.5 w-3.5" /></motion.button>
                      </li>
                    ))}
                    {cau.length === 0 && <li className="p-2 text-xs text-ink-soft">Đề chưa có câu nào. Nhập câu đầu tiên bên dưới.</li>}
                  </ul>
                </div>
              )}
              <form onSubmit={luuCau} className="mt-3 space-y-2.5 border border-ink/25 bg-paper-light p-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Câu số</label>
                    <input type="number" min={1} value={cauForm.thu_tu} onChange={(e) => setCauForm((c) => ({...c, thu_tu: Number(e.target.value)}))} className="w-full border border-ink/30 bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Điểm</label>
                    <input type="number" min={0.25} max={10} step={0.25} value={cauForm.diem} onChange={(e) => setCauForm((c) => ({...c, diem: Number(e.target.value)}))} className="w-full border border-ink/30 bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent" />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Dạng câu</label>
                    <select value={cauForm.loai} onChange={(e) => doiLoai(e.target.value as LoaiCau)} className="w-full border border-ink/30 bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent">
                      <option value="trac_nghiem">Trắc nghiệm A/B/C/D</option>
                      <option value="dung_sai">Đúng/Sai 4 phát biểu</option>
                      <option value="tra_loi_ngan">Trả lời ngắn</option>
                    </select>
                  </div>
                </div>
                <OSoan nhan="Nội dung câu hỏi" giaTri={cauForm.noi_dung} dat={(v) => setCauForm((c) => ({...c, noi_dung: v}))} rows={3} hienXem placeholder="VD: Cho hàm số y = x^3 - 3x. Khẳng định nào đúng?" goiY="Gõ chữ bình thường, bôi đen đoạn cần công thức rồi bấm nút." />
                {cauForm.loai !== "tra_loi_ngan" && (
                  <div className="space-y-1.5">
                    {kyHieuDangDung.map((k) => (
                      <div key={k} className="border border-ink/20 bg-paper p-2">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-display text-sm font-bold text-ink">{cauForm.loai === "trac_nghiem" ? `Phương án ${k}` : `Phát biểu ${k})`}</span>
                          {cauForm.loai === "trac_nghiem" ? (
                            <motion.button whileTap={buttonTap} type="button" onClick={() => setCauForm((c) => ({...c, dap_an_mcq: k}))} className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors ${cauForm.dap_an_mcq === k ? "border-ok bg-ok text-paper-light" : "border-ink/30 text-ink-soft hover:border-ok hover:text-ok"}`}>{cauForm.dap_an_mcq === k ? "Đáp án đúng" : "Chọn đúng"}</motion.button>
                          ) : (
                            <div className="flex gap-1">
                              {[true, false].map((g) => (
                                <motion.button key={String(g)} whileTap={buttonTap} type="button" onClick={() => setCauForm((c) => ({...c, dap_an_ds: {...c.dap_an_ds, [k]: g}}))} className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors ${cauForm.dap_an_ds[k] === g ? (g ? "border-ok bg-ok text-paper-light" : "border-danger bg-danger text-paper-light") : "border-ink/30 text-ink-soft hover:border-ink/60"}`}>{g ? "Đúng" : "Sai"}</motion.button>
                              ))}
                            </div>
                          )}
                        </div>
                        <OSoan giaTri={cauForm.lua_chon.find((x) => x.ky_hieu === k)?.noi_dung ?? ""} dat={(v) => doiLuaChon(k, v)} rows={2} gon placeholder="Chữ thường, thêm công thức khi cần" />
                      </div>
                    ))}
                  </div>
                )}
                {cauForm.loai === "tra_loi_ngan" && (
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Đáp án đúng</label>
                    <input type="text" value={cauForm.dap_an_ngan} onChange={(e) => setCauForm((c) => ({...c, dap_an_ngan: e.target.value}))} placeholder="VD: 12,5  ·  nhiều đáp án: 12,5|12.5" className="w-full border border-ink/30 bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
                    <p className="mt-1 text-[10px] text-ink-faint">Ngăn cách đáp án tương đương bằng dấu |. Hệ thống hiểu cả dấu phẩy và dấu chấm.</p>
                  </div>
                )}
                <OSoan nhan="Giải thích (hiện sau khi nộp)" giaTri={cauForm.giai_thich} dat={(v) => setCauForm((c) => ({...c, giai_thich: v}))} rows={2} hienXem placeholder="Giải bằng chữ thường, chèn công thức ở chỗ cần tính." />
                <div className="border border-ink/25 bg-paper p-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-ink-faint">Xem trước như học sinh thấy</p>
                    <motion.button whileTap={buttonTap} type="button" onClick={() => setXemTruoc((v) => !v)} className="flex items-center gap-1 border border-ink/30 bg-paper-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
                      <IconEye className="h-3 w-3" />
                      {xemTruoc ? "Ẩn" : "Hiện"}
                    </motion.button>
                  </div>
                  {xemTruoc && (
                    <div className="mt-2">
                      <p className="flex flex-wrap items-center gap-2 font-display text-sm font-bold text-ink">
                        Câu {cauForm.thu_tu}
                        <span className="border border-ink/30 px-1.5 text-[9px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-soft">{nhanLoai(cauForm.loai)}</span>
                        <span className="text-[10px] font-sans font-normal text-ink-faint">{cauForm.diem}đ</span>
                      </p>
                      <div className="mt-1.5 text-sm leading-relaxed text-ink"><Latex nguon={cauForm.noi_dung || "(chưa có nội dung)"} /></div>
                      {cauForm.loai !== "tra_loi_ngan" ? (
                        <ul className="mt-2 space-y-1">
                          {kyHieuDangDung.map((k) => {
                            const nd = cauForm.lua_chon.find((x) => x.ky_hieu === k)?.noi_dung ?? "";
                            const laDapAn = cauForm.loai === "trac_nghiem" ? cauForm.dap_an_mcq === k : cauForm.dap_an_ds[k] === true;
                            return (
                              <li key={k} className={`flex items-start gap-2 border px-2 py-1 text-sm ${cauForm.loai === "trac_nghiem" && laDapAn ? "border-ok bg-ok/10" : "border-ink/20 bg-paper-light"}`}>
                                <span className="font-bold text-ink">{cauForm.loai === "trac_nghiem" ? `${k}.` : `${k})`}</span>
                                <span className="min-w-0 flex-1 text-ink-soft"><Latex nguon={nd || "(trống)"} /></span>
                                {cauForm.loai === "dung_sai" && typeof cauForm.dap_an_ds[k] === "boolean" && (
                                  <span className={`shrink-0 border px-1 text-[9px] font-bold uppercase ${cauForm.dap_an_ds[k] ? "border-ok text-ok" : "border-danger text-danger"}`}>{cauForm.dap_an_ds[k] ? "Đúng" : "Sai"}</span>
                                )}
                                {cauForm.loai === "trac_nghiem" && laDapAn && <IconCheck className="h-3.5 w-3.5 shrink-0 text-ok" />}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="mt-2 border border-ok bg-ok/10 px-2 py-1 text-sm text-ok">Đáp án: {cauForm.dap_an_ngan ? cauForm.dap_an_ngan.split("|").join(" hoặc ") : "(chưa nhập)"}</p>
                      )}
                      {cauForm.giai_thich && (
                        <div className="mt-2 border-l-2 border-accent bg-paper-light p-2">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">Giải thích</p>
                          <div className="mt-0.5 text-sm leading-relaxed text-ink-soft"><Latex nguon={cauForm.giai_thich} /></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <motion.button whileTap={buttonTap} type="submit" disabled={dangLuuCau} className="nut-nhan flex items-center gap-1.5 border border-ink bg-ink px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-60">
                    {dangLuuCau ? <IconLoader className="h-3 w-3 animate-spin" /> : cauForm.id ? <IconCheck className="h-3 w-3" /> : <IconPlus className="h-3 w-3" />}
                    {cauForm.id ? "Cập nhật câu" : "Thêm câu"}
                  </motion.button>
                  {cauForm.id && (
                    <motion.button whileTap={buttonTap} type="button" onClick={() => setCauForm(cauRong(cau.length + 1))} className="border border-ink/40 bg-paper px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft">Hủy sửa câu</motion.button>
                  )}
                </div>
              </form>
              <p className="mt-2 flex items-start gap-1.5 text-[10px] text-ink-faint"><IconAlert className="mt-0.5 h-3 w-3 shrink-0 text-warn" />Nhập xong bấm “Công khai” ở bộ đề để member thấy trong phòng thi.</p>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}