"use client";
import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconAlert, IconArrowRight, IconLoader, IconSeal } from "@/components/Icons";
import Skeleton from "@/components/Skeleton";
import { buttonTap, fadeInUp, staggerContainer } from "@/lib/animations";
import { useAuth } from "@/lib/auth";
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, hoSo } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  if (loading || !user) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-10">
        <div className="flex items-center gap-2 text-sm text-ink-faint">
          <IconLoader className="h-4 w-4 animate-spin text-accent" />
          Đang kiểm tra quyền truy cập...
        </div>
        <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="sheet space-y-4 p-5 pl-8 shadow-paper lg:col-span-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-3 lg:col-span-3">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-xl px-4 pb-16 pt-12 sm:pt-20">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full min-w-0">
          <motion.div variants={fadeInUp} className="sheet relative overflow-hidden p-6 pl-9 shadow-paper">
            <motion.span
              initial={{ opacity: 0, scale: 1.5, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: -7 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
              className="pointer-events-none absolute right-3 top-3 border-2 border-accent/70 px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] text-accent/80"
            >
              Từ chối
            </motion.span>
            <span className="grid h-12 w-12 place-items-center border border-accent/60 bg-accent-wash text-accent">
              <IconAlert className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink">Khu vực hạn chế</h1>
            <p className="mt-3 text-sm text-ink-soft">
              Mục quản trị chỉ dành cho tài khoản có vai trò quản trị viên. Tài khoản của bạn hiện là người dùng thường nên không thể tải đề lên kho.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-ink/25 pt-4 text-xs uppercase tracking-[0.12em] text-ink-faint">
              <IconSeal className="h-4 w-4 text-accent" />
              <span className="truncate">{hoSo?.email ?? user.email}</span>
              <span className="border border-ink/40 px-2 py-0.5 text-ink-soft">Người dùng</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/" className="flex-1">
                <motion.span whileTap={buttonTap} className="flex items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent">
                  Về kho đề
                  <IconArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
              <Link href="/tai-khoan" className="flex-1">
                <motion.span whileTap={buttonTap} className="flex items-center justify-center border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
                  Trang cá nhân
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  return <>{children}</>;
}