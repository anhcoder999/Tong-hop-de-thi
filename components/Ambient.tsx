"use client";
import {motion, useScroll, useTransform} from "framer-motion";
const HAT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";
export default function Ambient() {
  const {scrollY} = useScroll();
  const y1 = useTransform(scrollY, [0, 1200], [0, 160]);
  const y2 = useTransform(scrollY, [0, 1200], [0, -130]);
  const y3 = useTransform(scrollY, [0, 1200], [0, 90]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div style={{y: y1}} className="absolute -left-40 -top-48 h-[32rem] w-[32rem] transform-gpu sm:h-[52rem] sm:w-[52rem]">
        <div className="lop-troi h-full w-full opacity-[0.3] dark:opacity-[0.22]" style={{background: "radial-gradient(circle at 36% 34%, rgb(var(--mark) / 0.75), rgb(var(--accent) / 0.22) 46%, transparent 72%)"}} />
      </motion.div>
      <motion.div style={{y: y2}} className="absolute -right-48 top-[18%] h-[28rem] w-[28rem] transform-gpu sm:h-[44rem] sm:w-[44rem]">
        <div className="lop-troi-2 h-full w-full opacity-[0.18] dark:opacity-[0.2]" style={{background: "radial-gradient(circle at 60% 42%, rgb(var(--cyan) / 0.6), rgb(var(--info) / 0.24) 50%, transparent 74%)"}} />
      </motion.div>
      <motion.div style={{y: y3}} className="absolute bottom-[-20%] left-[24%] h-[26rem] w-[26rem] transform-gpu sm:h-[38rem] sm:w-[38rem]">
        <div className="lop-troi h-full w-full opacity-[0.14] dark:opacity-[0.16]" style={{background: "radial-gradient(circle at 50% 50%, rgb(var(--grape) / 0.5), rgb(var(--ok) / 0.2) 52%, transparent 74%)"}} />
      </motion.div>
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]" style={{backgroundImage: HAT}} />
      <div className="absolute inset-y-0 left-[8%] hidden w-px bg-accent/25 lg:block" />
      <div className="absolute inset-0" style={{background: "linear-gradient(180deg, rgb(var(--paper) / 0.55) 0%, transparent 30%, transparent 70%, rgb(var(--paper) / 0.85) 100%)"}} />
    </div>
  );
}