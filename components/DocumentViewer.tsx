"use client";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";
import {IconArrowLeft, IconDownload, IconExternal, IconLoader} from "@/components/Icons";
import Skeleton from "@/components/Skeleton";
import {buttonTap, EASE} from "@/lib/animations";
const WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
export default function DocumentViewer({url, ten}: {url: string; ten: string}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<any>(null);
  const taskRef = useRef<{cancel: () => void; promise: Promise<unknown>} | null>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [trang, setTrang] = useState(1);
  const [tong, setTong] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dangTai, setDangTai] = useState(true);
  const [dangVe, setDangVe] = useState(true);
  const [loi, setLoi] = useState("");
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER;
        const doc = await pdfjs.getDocument({url}).promise;
        if (!alive) {
          doc.destroy();
          return;
        }
        docRef.current = doc;
        setPdf(doc);
        setTong(doc.numPages);
        setDangTai(false);
      } catch {
        if (alive) {
          setLoi("Không tải được PDF. Link có thể đã hết hạn, hãy tải lại trang.");
          setDangTai(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);
  useEffect(() => {
    return () => {
      if (taskRef.current) taskRef.current.cancel();
      if (docRef.current) docRef.current.destroy();
    };
  }, []);
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let cancelled = false;
    (async () => {
      setDangVe(true);
      const page = await pdf.getPage(trang);
      if (cancelled) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const base = page.getViewport({scale: zoom});
      canvas.width = Math.max(1, Math.floor(base.width * dpr));
      canvas.height = Math.max(1, Math.floor(base.height * dpr));
      canvas.style.width = `${base.width}px`;
      canvas.style.height = `${base.height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (taskRef.current) taskRef.current.cancel();
      const task = page.render({canvasContext: ctx, viewport: page.getViewport({scale: zoom * dpr})});
      taskRef.current = task;
      await task.promise;
      if (!cancelled) setDangVe(false);
    })().catch(() => {
      if (!cancelled) setDangVe(false);
    });
    return () => {
      cancelled = true;
    };
  }, [pdf, trang, zoom]);
  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <motion.button whileTap={buttonTap} type="button" onClick={() => router.push("/")} className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
          <IconArrowLeft className="h-4 w-4" />
          Quay lại
        </motion.button>
        <motion.a whileTap={buttonTap} href={url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent">
          <IconDownload className="h-4 w-4" />
          Tải PDF
        </motion.a>
        <motion.a whileTap={buttonTap} href={viewerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
          <IconExternal className="h-4 w-4" />
          Mở tab mới
        </motion.a>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-ink/25 bg-paper-light px-3 py-2">
        <div className="flex items-center gap-2">
          <motion.button whileTap={buttonTap} type="button" disabled={trang <= 1} onClick={() => setTrang((t) => Math.max(1, t - 1))} className="border border-ink/40 bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">
            Trước
          </motion.button>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            {dangTai ? "..." : `${trang}/${tong}`}
          </span>
          <motion.button whileTap={buttonTap} type="button" disabled={trang >= tong} onClick={() => setTrang((t) => Math.min(tong, t + 1))} className="border border-ink/40 bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">
            Sau
          </motion.button>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={buttonTap} type="button" disabled={zoom <= 0.7} onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.2).toFixed(2))))} aria-label="Thu nhỏ" className="border border-ink/40 bg-paper px-3 py-1.5 text-sm font-bold text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">
            −
          </motion.button>
          <span className="w-12 text-center text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">{Math.round(zoom * 100)}%</span>
          <motion.button whileTap={buttonTap} type="button" disabled={zoom >= 2.5} onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(2))))} aria-label="Phóng to" className="border border-ink/40 bg-paper px-3 py-1.5 text-sm font-bold text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">
            +
          </motion.button>
        </div>
      </div>
      <div className="viewer-scroll relative mt-3 max-h-[80vh] overflow-auto border border-ink/25 bg-paper-light p-3 shadow-paper">
        {dangTai ? (
          <div className="space-y-3 p-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[55%] w-full" />
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-ink-faint">
              <IconLoader className="h-4 w-4 animate-spin text-accent" />
              Đang dựng trang đề...
            </div>
          </div>
        ) : loi ? (
          <div className="border border-accent/50 bg-accent-wash p-5 text-sm text-accent-deep">{loi}</div>
        ) : (
          <>
            <canvas ref={canvasRef} className="mx-auto block bg-white shadow-paper" />
            {dangVe && (
              <div className="pointer-events-none sticky bottom-2 mx-auto mt-2 flex w-max items-center gap-2 border border-ink/30 bg-paper-light px-3 py-1.5 text-xs text-ink-soft shadow-paper">
                <IconLoader className="h-3.5 w-3.5 animate-spin text-accent" />
                Đang vẽ trang {trang}...
              </div>
            )}
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-faint">Bản render dùng độ phân giải màn hình nên chữ nét như trình đọc PDF trên máy. Dùng nút + / − để phóng to khi cần soi chi tiết.</p>
    </div>
  );
}