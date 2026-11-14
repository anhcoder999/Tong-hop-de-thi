"use client";
import { motion } from "framer-motion";
import { IconSearchX } from "@/components/Icons";
import { buttonTap, EASE, fadeInUp } from "@/lib/animations";
interface Props {
  tieuDe?: string;
  moTa?: string;
  onReset?: () => void;
}
export default function EmptyState({
  tieuDe = "Không tìm thấy đề nào",
  moTa = "Thử từ khóa khác hoặc đổi môn xem sao nhé.",
  onReset,
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
        transition={{ duration: 1.6, repeat: Infinity, ease: EASE }}
        className="grid h-14 w-14 place-items-center border border-ink/30 text-accent"
      >
        <IconSearchX className="h-6 w-6" />
      </motion.div>
      <h3 className="font-display text-xl font-bold text-ink">{tieuDe}</h3>
      <p className="max-w-xs text-sm text-ink-soft">{moTa}</p>
      {onReset && (
        <motion.button
          whileTap={buttonTap}
          type="button"
          onClick={onReset}
          className="mt-2 border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent"
        >
          Xóa bộ lọc
        </motion.button>
      )}
    </motion.div>
  );
}