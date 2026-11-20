"use client";
import {create} from "zustand";
import {batDauThi, ghiNhanThoat, layKetQua, luuNhap, nopBai} from "@/app/thi-thu/actions";
import {KY_HIEU_DS, type CauHoiCongKhai, type KetQuaBai, type TraLoi} from "@/lib/thiThu";
export type GiaiDoanPhong = "dangTai" | "dangLam" | "ketQua" | "loi";
type TrangThai = {giaiDoan: GiaiDoanPhong; baiThiId: string; ten: string; mon: string; hanNop: number; cau: CauHoiCongKhai[]; traLoi: TraLoi; idx: number; conLai: number; soLan: number; canhBao: number | null; hoiNop: boolean; dangNop: boolean; ketQua: KetQuaBai | null; loi: string};
const TRANG_KHOI: TrangThai = {giaiDoan: "dangTai", baiThiId: "", ten: "", mon: "", hanNop: 0, cau: [], traLoi: {}, idx: 0, conLai: 0, soLan: 0, canhBao: null, hoiNop: false, dangNop: false, ketQua: null, loi: ""};
type HanhDong = {
  moPhong: (id: string, baiCu: string | null) => Promise<"dangLam" | "ketQua" | "loi" | "moMoi">;
  chon: (cauId: string, giaTri: string | Record<string, boolean>) => void;
  chonY: (cauId: string, ky: string, giaTri: boolean) => void;
  xoaDapAn: (cauId: string) => void;
  setIdx: (i: number) => void;
  setHoiNop: (v: boolean) => void;
  dongCanhBao: () => void;
  nop: (tuDong: boolean) => Promise<void>;
  dungVongLap: () => void;
};
const vong: {timer: ReturnType<typeof setInterval> | null; luu: ReturnType<typeof setInterval> | null; deb: ReturnType<typeof setTimeout> | null; thoat: number; dangNop: boolean} = {timer: null, luu: null, deb: null, thoat: 0, dangNop: false};
let onAn = () => {};
let onMo = () => {};
export const usePhongThi = create<TrangThai & HanhDong>((set, get) => {
  const luuTam = () => {
    if (vong.deb) clearTimeout(vong.deb);
    vong.deb = setTimeout(() => {
      const s = get();
      if (s.baiThiId && s.giaiDoan === "dangLam") void luuNhap(s.baiThiId, s.traLoi);
    }, 1200);
  };
  const ghiThoat = async () => {
    const s = get();
    if (s.giaiDoan !== "dangLam" || vong.dangNop || !s.baiThiId) return;
    const now = Date.now();
    if (now - vong.thoat < 1500) return;
    vong.thoat = now;
    const kq = await ghiNhanThoat(s.baiThiId);
    if (!kq.ok && !kq.biHuy) return;
    if (kq.biHuy) {
      vong.dangNop = true;
      get().dungVongLap();
      const r = await layKetQua(s.baiThiId);
      set({soLan: kq.soLan, ketQua: r.ok ? r.ketQua : null, giaiDoan: r.ok ? "ketQua" : "dangLam"});
    } else set({soLan: kq.soLan, canhBao: kq.soLan});
  };
  onAn = () => {
    if (document.visibilityState === "hidden") void ghiThoat();
  };
  onMo = () => void ghiThoat();
  return {
    ...TRANG_KHOI,
    moPhong: async (id, baiCu) => {
      get().dungVongLap();
      vong.dangNop = false;
      vong.thoat = 0;
      set({...TRANG_KHOI});
      if (baiCu) {
        const r = await layKetQua(baiCu);
        if (r.ok) {
          set({ketQua: r.ketQua, giaiDoan: "ketQua"});
          return "ketQua";
        }
        return "moMoi";
      }
      const kq = await batDauThi(id);
      if (!kq.ok) {
        set({loi: kq.error, giaiDoan: "loi"});
        return "loi";
      }
      const han = new Date(kq.hanNop).getTime();
      set({baiThiId: kq.baiThiId, ten: kq.ten, mon: kq.mon, hanNop: han, cau: kq.cau, traLoi: kq.traLoi ?? {}, soLan: kq.soLanThoat, conLai: Math.max(0, Math.round((han - Date.now()) / 1000)), giaiDoan: "dangLam"});
      vong.timer = setInterval(() => {
        const con = Math.max(0, Math.round((get().hanNop - Date.now()) / 1000));
        set({conLai: con});
        if (con <= 0) void get().nop(true);
      }, 1000);
      vong.luu = setInterval(() => {
        const s = get();
        if (s.baiThiId && s.giaiDoan === "dangLam") void luuNhap(s.baiThiId, s.traLoi);
      }, 10000);
      document.addEventListener("visibilitychange", onAn);
      window.addEventListener("blur", onMo);
      return "dangLam";
    },
    chon: (cauId, giaTri) => {
      set((s) => ({traLoi: {...s.traLoi, [cauId]: giaTri}}));
      luuTam();
    },
    chonY: (cauId, ky, giaTri) => {
      set((s) => {
        const cu = s.traLoi[cauId];
        const obj = cu && typeof cu === "object" ? {...(cu as Record<string, boolean>)} : {};
        obj[ky] = giaTri;
        return {traLoi: {...s.traLoi, [cauId]: obj}};
      });
      luuTam();
    },
    xoaDapAn: (cauId) => {
      set((s) => {
        const moi = {...s.traLoi};
        delete moi[cauId];
        return {traLoi: moi};
      });
      luuTam();
    },
    setIdx: (i) => set({idx: i}),
    setHoiNop: (v) => set({hoiNop: v}),
    dongCanhBao: () => set({canhBao: null}),
    nop: async (tuDong) => {
      const s = get();
      if (vong.dangNop || !s.baiThiId) return;
      vong.dangNop = true;
      set({dangNop: true, hoiNop: false});
      const kq = await nopBai(s.baiThiId, s.traLoi);
      set({dangNop: false});
      if (kq.ok) {
        get().dungVongLap();
        set({ketQua: kq.ketQua, giaiDoan: "ketQua"});
      } else {
        vong.dangNop = false;
        if (!tuDong) set({loi: kq.error ?? "Lỗi nộp bài."});
      }
    },
    dungVongLap: () => {
      if (vong.timer) clearInterval(vong.timer);
      if (vong.luu) clearInterval(vong.luu);
      if (vong.deb) clearTimeout(vong.deb);
      vong.timer = null;
      vong.luu = null;
      vong.deb = null;
      document.removeEventListener("visibilitychange", onAn);
      window.removeEventListener("blur", onMo);
    }
  };
});
export function daLamCau(c: {id: string; loai: string}, tl: TraLoi): boolean {
  const v = tl[c.id];
  if (c.loai === "dung_sai") return !!v && typeof v === "object" && KY_HIEU_DS.every((k) => typeof (v as Record<string, boolean>)[k] === "boolean");
  return typeof v === "string" && v.trim() !== "";
}