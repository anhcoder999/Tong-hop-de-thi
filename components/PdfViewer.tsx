"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowLeft, IconDownload, IconExternal, IconLoader } from "@/components/Icons";
import Skeleton from "@/components/Skeleton";
import { buttonTap, EASE } from "@/lib/animations";
export default function PdfViewer({ url, ten }: { url: string; ten: string }) {
  const router = useRouter();
  const [daTai, setDaTai] = useState(false);
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <motion.button
          whileTap={buttonTap}
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper"
        >
          <IconArrowLeft className="h-4 w-4" />
          Quay lại
        </motion.button>
        <motion.a
          whileTap={buttonTap}
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent"
        >
          <IconDownload className="h-4 w-4" />
          Tải PDF
        </motion.a>
        <motion.a
          whileTap={buttonTap}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper"
        >
          <IconExternal className="h-4 w-4" />
          Mở tab mới
        </motion.a>
      </div>
      <div className="relative mt-4 overflow-hidden border border-ink/25 bg-paper-light shadow-paper">
        {!daTai && (
          <div className="absolute inset-0 z-10 space-y-3 bg-paper-light p-5">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-[55%] w-full" />
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-ink-faint">
              <IconLoader className="h-4 w-4 animate-spin text-accent" />
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
          className="h-[80vh] w-full border-0 bg-paper-light"
        />
      </div>
      <p className="mt-3 text-xs text-ink-faint">Mẹo: nếu khung trống, bấm Mở tab mới để xem trực tiếp.</p>
    </div>
  );
}