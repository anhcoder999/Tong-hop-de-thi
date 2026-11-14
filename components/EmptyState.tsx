"use client";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
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
      className="glass flex flex-col items-center gap-3 rounded-xl px-6 py-14 text-center shadow-soft"
    >
      {/* Icon nhún nhảy nhẹ lặp vô hạn cho đỡ trống trải */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: EASE }}
        className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500"
      >
        <SearchX size={26} />
      </motion.div>
      <h3 className="text-base font-bold text-slate-800">{tieuDe}</h3>
      <p className="max-w-xs text-sm text-slate-500">{moTa}</p>
      {onReset && (
        <motion.button
          whileTap={buttonTap}
          type="button"
          onClick={onReset}
          className="mt-2 rounded-2xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-shadow hover:shadow-lift"
        >
          Xóa bộ lọc
        </motion.button>
      )}
    </motion.div>
  );
}