"use client";
import {useEffect} from "react";
import Link from "next/link";
import {IconAlert, IconRefresh} from "@/components/Icons";
export default function Error({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto grid w-full max-w-xl flex-1 place-items-center px-4 py-20">
      <div className="sheet w-full border-2 border-danger bg-paper-light p-8 text-center shadow-lift">
        <IconAlert className="mx-auto h-10 w-10 text-danger" />
        <p className="mt-4 font-display text-6xl font-bold text-danger">500</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">Có lỗi khi dựng trang</h1>
        <p className="mt-3 text-sm text-ink-soft">Máy chủ vừa gặp sự cố tạm thời. Bấm thử lại, hoặc quay về trang chủ rồi mở lại đề.</p>
        {error.digest && <p className="mt-2 font-mono text-[11px] text-ink-faint">mã lỗi: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
            <IconRefresh className="h-4 w-4" />
            Thử lại
          </button>
          <Link href="/" className="inline-flex items-center gap-2 border border-ink/40 bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-deep">Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}