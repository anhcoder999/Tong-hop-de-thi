"use client";
import {motion, useScroll, useTransform} from "framer-motion";
const HAT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";
export default function Ambient() {
  const {scrollY} = useScroll();
  const y1 = useTransform(scrollY, [0, 900], [0, 120]);
  const y2 = useTransform(scrollY, [0, 900], [0, -90]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div style={{y: y1}} className="absolute -left-24 -top-24 h-[26rem] w-[26rem] transform-gpu sm:h-[40rem] sm:w-[40rem]">
        <div className="lop-troi h-full w-full opacity-[0.16] dark:opacity-[0.13]">
          <div className="h-full w-full rounded-full" style={{background: "radial-gradient(circle at 32% 32%, rgb(var(--accent) / 0.55), rgb(var(--warn) / 0.22) 46%, transparent 70%)"}} />
        </div>
      </motion.div>
      <motion.div style={{y: y2}} className="absolute -right-24 top-1/3 h-[22rem] w-[22rem] transform-gpu sm:h-[34rem] sm:w-[34rem]">
        <div className="lop-troi-2 h-full w-full opacity-[0.14] dark:opacity-[0.11]">
          <div className="h-full w-full rounded-full" style={{background: "radial-gradient(circle at 60% 40%, rgb(var(--info) / 0.5), rgb(var(--ok) / 0.2) 50%, transparent 72%)"}} />
        </div>
      </motion.div>
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]" style={{backgroundImage: HAT}} />
      <div className="absolute inset-0" style={{background: "radial-gradient(120% 90% at 50% 0%, transparent 60%, rgb(var(--ink) / 0.07) 100%)"}} />
    </div>
  );
}