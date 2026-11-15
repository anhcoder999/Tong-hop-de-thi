"use client";
import {useCallback, useEffect, useState} from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import {IconLoader, IconSeal, IconTrash, IconUpload} from "@/components/Icons";
import {supabase} from "@/lib/supabase";
import {dangThongBao, xoaThongBao, xinLinkAnhThongBao} from "@/app/actions";
import {buttonTap, fadeInUp} from "@/lib/animations";
type TB = {id: string; noi_dung: string; url_anh: string; created_at: string};
export default function ThongBaoAdmin() {
  const [ds, setDs] = useState<TB[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dangGui, setDangGui] = useState(false);
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
    try {
      let path: string | null = null;
      if (file) {
        const duoi = (file.name.split(".").pop() ?? "").toLowerCase();
        const link = await xinLinkAnhThongBao(duoi);
        if (!link.ok) throw new Error(link.error);
        const res = await fetch(link.signedUrl, {method: "PUT", body: file, headers: {"Content-Type": file.type}});
        if (!res.ok) throw new Error(`Upload ảnh thất bại: ${res.status}`);
        path = link.path;
      }
      const kq = await dangThongBao({noiDung: text, path});
      if (!kq.ok) throw new Error(kq.error ?? "Không đăng được thông báo.");
      setText("");
      setFile(null);
      setBao("Đã đăng thông báo, member đăng nhập sẽ thấy popup.");
      await tai();
    } catch (err) {
      setBao(err instanceof Error ? err.message : "Lỗi đăng thông báo.");
    } finally {
      setDangGui(false);
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
            {file ? file.name : "Đính kèm ảnh (png, jpg, webp, gif) — tùy chọn"}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }} />
          </label>
          <motion.button whileTap={buttonTap} type="submit" disabled={dangGui} className="flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-50">
            {dangGui ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconSeal className="h-4 w-4" />}
            {dangGui ? "Đang đăng..." : "Đăng thông báo"}
          </motion.button>
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