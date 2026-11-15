"use client";
import {useCallback, useEffect, useState} from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import {IconLoader, IconSeal, IconTrash, IconUpload} from "@/components/Icons";
import {supabase} from "@/lib/supabase";
import {dangThongBao, xoaThongBao, xinLinkAnhThongBao} from "@/app/actions";
import {buttonTap, fadeInUp} from "@/lib/animations";
import {formatDungLuong} from "@/lib/data";
type TB = {id: string; noi_dung: string; url_anh: string; created_at: string};
type AnhNen = {blob: Blob; duoi: string; contentType: string; w: number; h: number};
const ANH_DUOI = ["png", "jpg", "jpeg", "webp", "gif"];
function duoiTuFile(file: File): string {
  const n = (file.name.split(".").pop() ?? "").toLowerCase();
  if (ANH_DUOI.includes(n)) return n;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}
async function nenAnh(file: File): Promise<AnhNen | null> {
  let src: ImageBitmap | HTMLImageElement;
  let w: number;
  let h: number;
  try {
    src = await createImageBitmap(file, {imageOrientation: "from-image"});
    w = src.width;
    h = src.height;
  } catch {
    src = await new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      const u = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(u);
        res(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(u);
        rej(new Error("Không đọc được ảnh."));
      };
      img.src = u;
    });
    w = src.naturalWidth;
    h = src.naturalHeight;
  }
  const dong = () => {
    if ("close" in src) src.close();
  };
  if (w * h > 40000000 || Math.max(w, h) > 8192) {
    dong();
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    dong();
    return null;
  }
  ctx.drawImage(src as CanvasImageSource, 0, 0, w, h);
  dong();
  const webp = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.9));
  if (webp && webp.type === "image/webp" && webp.size < file.size) {
    canvas.width = 0;
    canvas.height = 0;
    return {blob: webp, duoi: "webp", contentType: "image/webp", w, h};
  }
  const jpg = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
  canvas.width = 0;
  canvas.height = 0;
  if (jpg && jpg.size < file.size) return {blob: jpg, duoi: "jpg", contentType: "image/jpeg", w, h};
  return null;
}
function taiAnh(blob: Blob, url: string, contentType: string, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.timeout = 120000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload ảnh thất bại: ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("Lỗi mạng khi upload ảnh."));
    xhr.ontimeout = () => reject(new Error("Upload ảnh quá 120s."));
    xhr.send(blob);
  });
}
export default function ThongBaoAdmin() {
  const [ds, setDs] = useState<TB[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dangGui, setDangGui] = useState(false);
  const [giaiDoan, setGiaiDoan] = useState("");
  const [tienDo, setTienDo] = useState(0);
  const [daNen, setDaNen] = useState("");
  const [bao, setBao] = useState("");
  const tai = useCallback(async () => {
    const {data} = await supabase.from("thong_bao").select("id,noi_dung,url_anh,created_at").order("created_at", {ascending: false});
    setDs((data ?? []) as TB[]);
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  const gui = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dangGui) return;
    if (!text.trim() && !file) {
      setBao("Thông báo cần text hoặc ảnh.");
      return;
    }
    setDangGui(true);
    setBao("");
    setTienDo(0);
    setDaNen("");
    try {
      let path: string | null = null;
      if (file) {
        let blob: Blob = file;
        let duoi = duoiTuFile(file);
        let contentType = file.type || "image/jpeg";
        if (file.type !== "image/gif" && file.size > 300 * 1024) {
          setGiaiDoan("Đang nén ảnh, giữ độ phân giải gốc...");
          const nen = await nenAnh(file);
          if (nen) {
            blob = nen.blob;
            duoi = nen.duoi;
            contentType = nen.contentType;
            setDaNen(`${formatDungLuong(file.size)} → ${formatDungLuong(nen.blob.size)} · ${nen.w}×${nen.h}px`);
          } else {
            setDaNen(`Giữ nguyên bản gốc ${formatDungLuong(file.size)}`);
          }
        }
        setGiaiDoan("Đang xin link upload...");
        const link = await xinLinkAnhThongBao(duoi);
        if (!link.ok) throw new Error(link.error);
        setGiaiDoan("Đang tải ảnh lên kho...");
        await taiAnh(blob, link.signedUrl, contentType, setTienDo);
        path = link.path;
      }
      setGiaiDoan("Đang ghi thông báo...");
      const kq = await dangThongBao({noiDung: text, path});
      if (!kq.ok) throw new Error(kq.error ?? "Không đăng được thông báo.");
      setText("");
      setFile(null);
      setDaNen("");
      setBao("Đã đăng thông báo, member đăng nhập sẽ thấy popup.");
      await tai();
    } catch (err) {
      setBao(err instanceof Error ? err.message : "Lỗi đăng thông báo.");
    } finally {
      setDangGui(false);
      setGiaiDoan("");
      setTienDo(0);
    }
  };
  const xoa = async (id: string) => {
    if (!window.confirm("Xóa thông báo này?")) return;
    const kq = await xoaThongBao(id);
    setBao(kq.ok ? "Đã xóa thông báo." : (kq.error ?? "Lỗi xóa."));
    await tai();
  };
  return (
    <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto mt-10 w-full min-w-0 max-w-6xl px-4 pb-16">
      <div className="sheet border border-ink/25 bg-paper-light p-5 shadow-paper">
        <h2 className="flex items-center gap-2 border-b-2 border-ink pb-4 font-display text-lg font-bold text-ink">
          <IconSeal className="h-4 w-4 text-accent" />
          Đăng thông báo popup
        </h2>
        <form onSubmit={gui} className="mt-4 space-y-3">
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={4} placeholder="Nội dung thông báo gửi tới thành viên đã đăng nhập..." className="w-full border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent" />
          <label className="flex cursor-pointer items-center gap-2 border-2 border-dashed border-ink/40 bg-paper p-3 text-sm text-ink-soft transition-colors hover:border-accent">
            <IconUpload className="h-4 w-4 text-accent" />
            <span className="min-w-0 flex-1 truncate">{file ? file.name : "Đính kèm ảnh — nén giữ nguyên độ phân giải gốc"}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }} />
          </label>
          {daNen && <p className="text-[11px] uppercase tracking-[0.1em] text-accent-deep">{daNen}</p>}
          <motion.button whileTap={buttonTap} type="submit" disabled={dangGui} className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-50 sm:w-auto">
            {dangGui ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconSeal className="h-4 w-4" />}
            {dangGui ? `${giaiDoan}${tienDo > 0 && tienDo < 100 ? ` · ${tienDo}%` : ""}` : "Đăng thông báo"}
          </motion.button>
          {dangGui && (
            <div className="h-1 w-full overflow-hidden bg-ink/15">
              <motion.div animate={{width: `${tienDo}%`}} transition={{duration: 0.2}} className="h-full bg-accent" />
            </div>
          )}
          {bao && <p className="border border-accent/50 bg-accent-wash p-2.5 text-xs text-accent-deep">{bao}</p>}
        </form>
        <ul className="mt-5 space-y-2">
          {ds.map((t) => (
            <li key={t.id} className="flex min-w-0 items-start gap-3 border border-ink/20 bg-paper p-3">
              {t.url_anh && <Image src={t.url_anh} alt="Ảnh thông báo" width={64} height={64} className="h-16 w-16 shrink-0 border border-ink/25 object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 whitespace-pre-wrap text-sm text-ink">{t.noi_dung || "(chỉ ảnh)"}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-ink-faint">{new Date(t.created_at).toLocaleString("vi-VN")}</p>
              </div>
              <motion.button whileTap={buttonTap} type="button" onClick={() => void xoa(t.id)} aria-label="Xóa thông báo" className="shrink-0 border border-transparent p-1.5 text-accent transition-colors hover:border-accent hover:bg-accent-wash">
                <IconTrash className="h-4 w-4" />
              </motion.button>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}