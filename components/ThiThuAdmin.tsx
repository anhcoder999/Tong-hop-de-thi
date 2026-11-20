"use client";
import {useCallback, useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Controller, useWatch, type Control, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {IconAlert, IconCheck, IconClose, IconEdit, IconEye, IconLoader, IconPlus, IconRefresh, IconSeal, IconTrash} from "@/components/Icons";
import Latex from "@/components/Latex";
import {capNhatDeOnline, congKhaiDeOnline, layCauHoiAdmin, layDeOnlineAdmin, luuCauHoi, taoDeOnline, xoaCauHoi, xoaDeOnline} from "@/app/thi-thu/actions";
import {DS_MON, MON_DAY_DU} from "@/lib/data";
import {KY_HIEU_DS, KY_HIEU_MCQ, nhanLoai, type CauHoiDayDu, type DeThiOnline, type LoaiCau, type LuaChon} from "@/lib/thiThu";
import {schemaBoDe, schemaCauHoi, type GiaTriBoDe, type GiaTriCauHoi, type LoiForm} from "@/lib/schema";
import {buttonTap, fadeInUp} from "@/lib/animations";
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
const boRong: GiaTriBoDe = {mon: "Toán", ten: "", mo_ta: "", thoi_gian_phut: 50};
const cauRong = (thuTu: number): GiaTriCauHoi => ({thu_tu: thuTu, diem: 1, loai: "trac_nghiem", noi_dung: "", lua_chon: KY_HIEU_MCQ.map((k) => ({ky_hieu: k, noi_dung: ""})), dap_an_mcq: "", dap_an_ds: {}, dap_an_ngan: "", giai_thich: ""});
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
  const noi = useRef<HTMLTextAreaElement | null>(null);
  const ds = gon ? GON : [...KHUNG, ...KY_HIEU];
  return (
    <div>
      {nhan && <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{nhan}</label>}
      <div className="mb-1 flex flex-wrap gap-1">
        {ds.map((n) => (
          <button key={n.nhan} type="button" onClick={() => chenCongThuc(noi.current, giaTri, dat, n.than, n.block)} className="border border-ink/25 bg-paper px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent">
            {n.nhan}
          </button>
        ))}
      </div>
      <textarea ref={noi} value={giaTri} onChange={(e) => dat(e.target.value)} rows={rows} placeholder={placeholder} className="w-full border border-ink/30 bg-paper-light px-3 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
      {goiY && <p className="mt-1 text-[10px] leading-relaxed text-ink-faint">{goiY}</p>}
      {hienXem && giaTri.trim() !== "" && (
        <div className="mt-1.5 border border-dashed border-ink/25 bg-paper p-2.5 text-sm leading-relaxed text-ink">
          <Latex nguon={giaTri} />
        </div>
      )}
    </div>
  );
}
function XemTruocCau({control}: {control: Control<GiaTriCauHoi>}) {
  const g = useWatch({control});
  const ky = g.loai === "dung_sai" ? KY_HIEU_DS : KY_HIEU_MCQ;
  return (
    <div className="mt-2">
      <p className="flex flex-wrap items-center gap-2 font-display text-sm font-bold text-ink">
        Câu {g.thu_tu || "—"}
        <span className="border border-ink/30 px-1.5 text-[9px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-soft">{nhanLoai(g.loai)}</span>
        <span className="text-[10px] font-sans font-normal text-ink-faint">{g.diem}đ</span>
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-ink"><Latex nguon={g.noi_dung || "(chưa có nội dung)"} /></div>
      {g.loai !== "tra_loi_ngan" ? (
        <ul className="mt-2 space-y-1">
          {ky.map((k) => {
            const nd = g.lua_chon.find((x) => x.ky_hieu === k)?.noi_dung ?? "";
            const laDapAn = g.loai === "trac_nghiem" ? g.dap_an_mcq === k : g.dap_an_ds[k] === true;
            return (
              <li key={k} className={`flex items-start gap-2 border px-2 py-1 text-sm ${g.loai === "trac_nghiem" && laDapAn ? "border-ok bg-ok/10" : "border-ink/20 bg-paper-light"}`}>
                <span className="font-bold text-ink">{g.loai === "trac_nghiem" ? `${k}.` : `${k})`}</span>
                <span className="min-w-0 flex-1 text-ink-soft"><Latex nguon={nd || "(trống)"} /></span>
                {g.loai === "dung_sai" && typeof g.dap_an_ds[k] === "boolean" && (
                  <span className={`shrink-0 border px-1 text-[9px] font-bold uppercase ${g.dap_an_ds[k] ? "border-ok text-ok" : "border-danger text-danger"}`}>{g.dap_an_ds[k] ? "Đúng" : "Sai"}</span>
                )}
                {g.loai === "trac_nghiem" && laDapAn && <IconCheck className="h-3.5 w-3.5 shrink-0 text-ok" />}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 border border-ok bg-ok/10 px-2 py-1 text-sm text-ok">Đáp án: {g.dap_an_ngan ? g.dap_an_ngan.split("|").join(" hoặc ") : "(chưa nhập)"}</p>
      )}
      {g.giai_thich && (
        <div className="mt-2 border-l-2 border-accent bg-paper-light p-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">Giải thích</p>
          <div className="mt-0.5 text-sm leading-relaxed text-ink-soft"><Latex nguon={g.giai_thich} /></div>
        </div>
      )}
    </div>
  );
}
export default function ThiThuAdmin() {
  const [ds, setDs] = useState<DeThiOnline[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [bao, setBao] = useState<{kieu: "ok" | "loi"; text: string} | null>(null);
  const [deSua, setDeSua] = useState<string | null>(null);
  const [dangLuuDe, setDangLuuDe] = useState(false);
  const [moFormDe, setMoFormDe] = useState(false);
  const [deChon, setDeChon] = useState<string | null>(null);
  const [cau, setCau] = useState<CauHoiDayDu[]>([]);
  const [dangTaiCau, setDangTaiCau] = useState(false);
  const [cauSua, setCauSua] = useState<string | null>(null);
  const [dangLuuCau, setDangLuuCau] = useState(false);
  const [xemTruoc, setXemTruoc] = useState(false);
  const formBo = useForm<GiaTriBoDe>({resolver: zodResolver(schemaBoDe), defaultValues: boRong});
  const formCau = useForm<GiaTriCauHoi>({resolver: zodResolver(schemaCauHoi), defaultValues: cauRong(1)});
  const loaiHien = formCau.watch("loai");
  const loiBo = formBo.formState.errors as LoiForm;
  const loiCau = formCau.formState.errors as LoiForm;
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
    if (kq.ok) setCau(kq.ds);
    else setBao({kieu: "loi", text: kq.error});
    setDangTaiCau(false);
  }, []);
  const chonDe = (id: string) => {
    setDeChon(id);
    setCauSua(null);
    formCau.reset(cauRong(1));
    void taiCau(id);
  };
  const luuBo = formBo.handleSubmit(async (g) => {
    if (dangLuuDe) return;
    setDangLuuDe(true);
    const kq = deSua ? await capNhatDeOnline(deSua, g) : await taoDeOnline(g);
    if (kq.ok) {
      setBao({kieu: "ok", text: deSua ? "Đã cập nhật đề." : "Đã tạo đề. Giờ nhập câu hỏi bên dưới."});
      formBo.reset(boRong);
      setDeSua(null);
      setMoFormDe(false);
      await tai();
    } else setBao({kieu: "loi", text: kq.error ?? "Lỗi lưu đề."});
    setDangLuuDe(false);
  });
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
  const doiLoai = (l: LoaiCau) => {
    formCau.setValue("loai", l);
    formCau.setValue("lua_chon", (l === "dung_sai" ? KY_HIEU_DS : KY_HIEU_MCQ).map((k) => ({ky_hieu: k, noi_dung: ""})));
    formCau.setValue("dap_an_mcq", "");