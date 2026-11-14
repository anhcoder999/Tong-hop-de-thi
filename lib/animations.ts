import type { Transition, Variants } from "framer-motion";
export const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
export const spring: Transition = { type: "spring", stiffness: 300, damping: 25 };
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
export const cardHover: Variants = {
  hover: {
    rotate: -0.8,
    y: -6,
    boxShadow: "8px 10px 0 rgba(33,29,24,0.12)",
    transition: { duration: 0.25, ease: EASE },
  },
};
export const stampIn: Variants = {
  hidden: { opacity: 0, scale: 1.3, rotate: -10 },
  visible: { opacity: 1, scale: 1, rotate: -2, transition: { type: "spring", stiffness: 300, damping: 25 } },
};
export const buttonTap = { scale: 0.97 };
export const tapCard = { scale: 0.99 };