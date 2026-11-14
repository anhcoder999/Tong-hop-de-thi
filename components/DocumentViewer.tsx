"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowLeft, IconDownload, IconExternal, IconLoader } from "@/components/Icons";
import Skeleton from "@/components/Skeleton";
import { buttonTap, EASE } from "@/lib/animations";
import { resolveUrl } from "@/lib/sampleDocx";
import type { Loai } from "@/lib/data";
const WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
function PdfEngine({ src, zoom, onReady, onError }: { src: string; zoom: number; onReady: () => void; onError: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    const tasks: { cancel?: () => void }[] = [];
    let doc: { destroy?: () => void; numPages: number; getPage: (n: number) => Promise<unknown> } | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER;
        const res = await fetch(src);
        const data = await res.arrayBuffer();
        const loaded = await pdfjs.getDocument({ data }).promise;
        doc = loaded as unknown as typeof doc;
        if (!alive) return;
        const first = (await loaded.getPage(1)) as { getViewport: (o: { scale: number }) => { width: number } };
        const base = first.getViewport({ scale: 1 });
        const fit = ((wrapRef.current?.clientWidth ?? 800) - 24) / base.width;
        const scale = fit * zoom;
        const host = hostRef.current;
        if (host) host.innerHTML = "";
        for (let i = 1; i <= loaded.numPages; i++) {
          const page = (await loaded.getPage(i)) as {
            getViewport: (o: { scale: number }) => { width: number; height: number };
            render: (o: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void>; cancel?: () => void };
          };
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.floor(vp.width * dpr);
          canvas.height = Math.floor(vp.height * dpr);
          canvas.style.width = `${vp.width}px`;
          canvas.style.height = `${vp.height}px`;
          canvas.className = "pdf-page";
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.scale(dpr, dpr);
          host?.appendChild(canvas);
          const t = page.render({ canvasContext: ctx, viewport: vp });
          tasks.push(t);
          await t.promise;
          if (!alive) return;
        }
        onReady();
      } catch {
        if (alive) onError();
      }
    })();
    return () => {
      alive = false;
      tasks.forEach((t) => t.cancel?.());
      doc?.destroy?.();
    };
  }, [src, zoom, onReady, onError]);
  return (
    <div ref={wrapRef} className="viewer-scroll h-[80vh] overflow-auto bg-paper-deep/40 p-3">
      <div ref={hostRef} className="flex flex-col items-center gap-3" />
    </div>
  );
}
function DocxEngine({ src, zoom, onReady, onError }: { src: string; zoom: number; onReady: () => void; onError: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { renderAsync } = await import("docx-preview");
        const res = await fetch(src);
        const data = await res.arrayBuffer();
        if (!alive || !hostRef.current) return;
        hostRef.current.innerHTML = "";
        await renderAsync(data, hostRef.current, undefined, {
          className: "docx",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
        });
        if (alive) onReady();
      } catch {
        if (alive) onError();
      }
    })();
    return () => {
      alive = false;
    };
  }, [src, onReady, onError]);
  return (
    <div className="viewer-scroll h-[80vh] overflow-auto bg-paper-deep/40 p-3">
      <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
        <div ref={hostRef} />
      </div>
    </div>
  );
}
export default function DocumentViewer({ url, ten, loai }: { url: string; ten: string; loai?: Loai }) {
  const router = useRouter();
  const [src, setSrc] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const kind: Loai = loai ?? (url.toLowerCase().endsWith(".docx") ? "docx" : "pdf");
  useEffect(() => {
    let alive = true;
    setReady(false);
    setError(false);
    setZoom(1);
    resolveUrl(url).then((u) => {
      if (alive) setSrc(u);
    });
    return () => {
      alive = false;
    };
  }, [url]);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setError(true), []);
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <motion.button whileTap={buttonTap} type="button" onClick={() => router.push("/")} className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
          <IconArrowLeft className="h-4 w-4" />
          Quay lại
        </motion.button>
        <motion.a whileTap={buttonTap} href={src || url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent">
          <IconDownload className="h-4 w-4" />
          Tải file
        </motion.a>
        <motion.a whileTap={buttonTap} href={src || url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
          <IconExternal className="h-4 w-4" />
          Mở tab mới
        </motion.a>
        <div className="ml-auto flex items-center gap-1 border border-ink/30 bg-paper-light">
          <motion.button whileTap={buttonTap} type="button" aria-label="Thu nhỏ" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="px-3 py-2 text-sm font-bold text-ink transition-colors active:bg-accent-wash hover:bg-paper">
            −
          </motion.button>
          <span className="min-w-[3.5rem] text-center text-xs font-semibold text-ink-soft">{Math.round(zoom * 100)}%</span>
          <motion.button whileTap={buttonTap} type="button" aria-label="Phóng to" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="px-3 py-2 text-sm font-bold text-ink transition-colors active:bg-accent-wash hover:bg-paper">
            +
          </motion.button>
          <motion.button whileTap={buttonTap} type="button" onClick={() => setZoom(1)} className="border-l border-ink/30 px-3 py-2 text-xs font-semibold text-ink-soft transition-colors active:bg-accent-wash hover:bg-paper">
            Vừa khung
          </motion.button>
        </div>
      </div>
      <div className="relative mt-4 overflow-hidden border border-ink/25 bg-paper-light shadow-paper">
        {!ready && !error && (
          <div className="absolute inset-0 z-10 space-y-3 bg-paper-light p-5">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-[55%] w-full" />
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-ink-faint">
              <IconLoader className="h-4 w-4 animate-spin text-accent" />
              Đang dựng tài liệu...
            </div>
          </div>
        )}
        {error && (
          <div className="flex h-[80vh] flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-display text-xl font-bold text-accent">Không dựng được tài liệu</p>
            <p className="max-w-sm text-sm text-ink-soft">File có thể chặn truy cập hoặc hỏng. Bấm Tải file hoặc Mở tab mới để xem trực tiếp.</p>
          </div>
        )}
        {src && !error && (kind === "pdf" ? <PdfEngine src={src} zoom={zoom} onReady={onReady} onError={onError} /> : <DocxEngine src={src} zoom={zoom} onReady={onReady} onError={onError} />)}
      </div>
      <p className="mt-3 text-xs text-ink-faint">
        {kind === "pdf" ? "PDF giữ nguyên font nhúng. Dùng nút cộng trừ để phóng to." : "DOCX giữ layout và font gần như Word. Dùng nút cộng trừ để phóng to."} Chỉ nút Tải file mới lưu về máy.
      </p>
    </div>
  );
}