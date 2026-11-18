const HAT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";
export default function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="lop-troi absolute -left-28 -top-28 h-[42rem] w-[42rem] rounded-full opacity-[0.14] blur-3xl dark:opacity-[0.12]" style={{background: "radial-gradient(circle at 30% 30%, rgb(var(--accent) / 0.6), rgb(var(--warn) / 0.28) 45%, transparent 70%)"}} />
      <div className="lop-troi-2 absolute -right-32 top-1/3 h-[36rem] w-[36rem] rounded-full opacity-[0.12] blur-3xl dark:opacity-[0.1]" style={{background: "radial-gradient(circle at 60% 40%, rgb(var(--info) / 0.55), rgb(var(--ok) / 0.24) 50%, transparent 72%)"}} />
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]" style={{backgroundImage: HAT}} />
      <div className="absolute inset-0" style={{background: "radial-gradient(120% 90% at 50% 0%, transparent 60%, rgb(var(--ink) / 0.07) 100%)"}} />
    </div>
  );
}