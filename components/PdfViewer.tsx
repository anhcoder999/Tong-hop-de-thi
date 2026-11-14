"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, ExternalLink, FileWarning, Loader2 } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import { buttonTap, EASE } from "@/lib/animations";
export default function PdfViewer({ url, ten }: { url: string; ten: string }) {
  const router = useRouter();
  const [daTai, setDaTai] = useState(false);
  const [quaCham, setQuaCham] = useState(false);
  // Đổi PDF thì reset trạng thái; quá 8 giây chưa load xong thì hiện lối thoát
  useEffect(() => {
    setDaTai(false);
    setQuaCham(false);
    const t = setTimeout(() => {
      setDaTai(true);
      setQuaCham(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [url]);
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
        {/* Skeleton shimmer phủ lên trong lúc chờ iframe tải PDF */}
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
        {/* PDF fade-in khi load xong, cao 80vh full chiều ngang */}
        <motion.iframe
          key={url}
          src={url}
          title={ten}
          onLoad={() => setDaTai(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: daTai ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="h-[80vh] w-full border-0 bg-white"
        />
        {/* Nhiều trình duyệt Android không nhúng được PDF, đưa lối thoát rõ ràng */}
        {quaCham && (
          <div className="absolute inset-x-4 bottom-4 z-20 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/95 p-3.5 text-sm text-amber-800 shadow-soft backdrop-blur">
            <FileWarning size={17} className="mt-0.5 shrink-0" />
            <p>
              Khung trắng trơn? Trình duyệt của bạn không nhúng được PDF - bấm <b>Tải PDF</b> hoặc <b>Mở tab mới</b> ở trên là xem ngon lành.
            </p>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-400">Mẹo: trên điện thoại nên bấm Mở tab mới để xem PDF mượt nhất.</p>
    </div>
  );
}