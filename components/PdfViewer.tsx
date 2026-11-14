"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, ExternalLink, Loader2 } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import { buttonTap, EASE } from "@/lib/animations";

export default function PdfViewer({ url, ten }: { url: string; ten: string }) {
  const router = useRouter();
  const [daTai, setDaTai] = useState(false);
  // Google Docs Viewer render PDF qua server Google, hoạt động trên mọi trình duyệt
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <motion.button
          whileTap={buttonTap}
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </motion.button>
        <motion.a
          whileTap={buttonTap}
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-shadow hover:shadow-lift"
        >
          <Download size={16} />
          Tải PDF
        </motion.a>
        <motion.a
          whileTap={buttonTap}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
        >
          <ExternalLink size={16} />
          Mở tab mới
        </motion.a>
      </div>
      <div className="glass relative mt-4 overflow-hidden rounded-xl shadow-soft">
        {!daTai && (
          <div className="absolute inset-0 z-10 space-y-3 bg-white p-5">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-[55%] w-full rounded-xl" />
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin text-brand-500" />
              Đang tải đề...
            </div>
          </div>
        )}
        <motion.iframe
          key={viewerUrl}
          src={viewerUrl}
          title={ten}
          onLoad={() => setDaTai(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: daTai ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="h-[80vh] w-full border-0 bg-white"
        />
      </div>
      <p className="mt-3 text-xs text-slate-400">Mẹo: nếu PDF vẫn không hiển thị, bấm "Mở tab mới" để xem trực tiếp.</p>
    </div>
  );
}