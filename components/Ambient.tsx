"use client";
import {motion, useScroll, useTransform} from "framer-motion";
const HAT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";
export default function Ambient() {
  const {scrollY} = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 140]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -110]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 70]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div style={{y: y1}} className="absolute -left-32 -top-40 h-[30rem] w-[30rem] transform-gpu sm:h-[46rem] sm:w-[46rem]">
        <div className="lop-troi h-full w-full opacity-[0.22] dark:opacity-[0.16]" style={{background: "radial-gradient(circle at 34% 34%, rgb(var(--accent) / 0.55), rgb(var(--info) / 0.22) 48%, transparent 72%)"}} />
      </motion.div>
      <motion.div style={{y: y2}} className="absolute -right-40 top-[22%] h-[26rem] w-[26rem] transform-gpu sm:h-[40rem] sm:w-[40rem]">
        <div className="lop-troi-2 h-full w-full opacity-[0.16] dark:opacity-[0.13]" style={{background: "radial-gradient(circle at 62% 40%, rgb(var(--grape) / 0.42), rgb(var(--info) / 0.2) 52%, transparent 74%)"}} />
      </motion.div>
      <motion.div style={{y: y3}} className="absolute bottom-[-18%] left-[28%] h-[24rem] w-[24rem] transform-gpu sm:h-[34rem] sm:w-[34rem]">
        <div className="lop-troi h-full w-full opacity-[0.12] dark:opacity-[0.1]" style={{background: "radial-gradient(circle at 50% 50%, rgb(var(--warn) / 0.32), rgb(var(--ok) / 0.16) 50%, transparent 72%)"}} />
      </motion.div>
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]" style={{backgroundImage: HAT}} />
      <div className="absolute inset-0" style={{background: "radial-gradient(130% 80% at 50% -10%, rgb(var(--paper-light) / 0.7) 0%, transparent 55%), linear-gradient(180deg, transparent 60%, rgb(var(--paper) / 0.9) 100%)"}} />
    </div>
  );
}