import Link from "next/link";
import {IconArrowLeft, IconSeal} from "@/components/Icons";
export default function NotFound() {
  return (
    <div className="mx-auto grid w-full max-w-xl flex-1 place-items-center px-4 py-20">
      <div className="sheet w-full border-2 border-ink bg-paper-light p-8 text-center shadow-lift">
        <IconSeal className="mx-auto h-10 w-10 text-accent" />
        <p className="mt-4 font-display text-6xl font-bold text-accent">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">Trang này không tồn tại</h1>
        <p className="mt-3 text-sm text-ink-soft">Đề hoặc đường dẫn bạn tìm đã bị xóa, đổi tên, hoặc chưa từng có trong kho. Quay về mục lục để chọn đề khác nhé.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
          <IconArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}