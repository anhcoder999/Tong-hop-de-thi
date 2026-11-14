import type { Transition, Variants } from "framer-motion";
// Easing chuẩn toàn dự án theo yêu cầu: cubic-bezier(0.4, 0, 0.2, 1)
export const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
// Spring chuẩn toàn dự án: stiffness 300, damping 25
export const spring: Transition = { type: "spring", stiffness: 300, damping: 25 };
// Chuyển trang và xuất hiện khối: mờ dần hiện rõ + trượt lên 20px
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};
// Container phát hiệu ứng lần lượt cho con, mỗi card cách nhau đúng 50ms
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
// Hover card: phóng 1.02 + bóng xanh glow, dùng chung với fadeInUp bằng cách spread
export const cardHover: Variants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 12px 32px rgba(59, 130, 246, 0.22)",
    transition: { duration: 0.25, ease: EASE },
  },
};
// Nhấn nút lõm xuống 0.95, nhả ra tự về 1
export const buttonTap = { scale: 0.95 };
