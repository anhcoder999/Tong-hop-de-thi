"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconSearchX, IconUpload } from "@/components/Icons";
import { buttonTap, EASE, fadeInUp } from "@/lib/animations";
interface Props {
  tieuDe?: string;
  moTa?: string;
  onReset?: () => void;
  ctaHref?: string;
  ctaLabel?: string;
  kieu?: "tim" | "kho";
}
export default function EmptyState({
  tieuDe = "Không tìm thấy đề nào",
  moTa = "Thử từ khóa khác hoặc đổi môn xem sao nhé.",
  onReset,
  ctaHref,
  ctaLabel,
  kieu = "tim",
}: Props) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-3 border border-dashed border-ink/40 bg-paper-light/60 px-6 py-14 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: EASE }}
        className="grid h-14 w-14 place-items-center border border-ink/30 text-accent"
      >
        {kieu === "kho" ? <IconUpload className="h-6 w-6" /> : <IconSearchX className="h-6 w-6" />}
      </motion.div>
      <h3 className="font-display text-xl font-bold text-ink">{tieuDe}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{moTa}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
        {onReset && (
          <motion.button whileTap={buttonTap} type="button" onClick={onReset} className="border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent">
            Xóa bộ lọc
          </motion.button>
        )}
        {ctaHref && ctaLabel && (
          <Link href={ctaHref}>
            <motion.span whileTap={buttonTap} className="flex items-center gap-2 border border-accent bg-accent-wash px-5 py-2.5 text-sm font-semibold text-accent-deep transition-colors active:bg-accent active:text-paper-light hover:bg-accent hover:text-paper-light">
              <IconUpload className="h-4 w-4" />
              {ctaLabel}
            </motion.span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}