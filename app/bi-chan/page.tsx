import type {Metadata} from "next";
import Link from "next/link";
import {IconSeal} from "@/components/Icons";
export const metadata: Metadata = {
  title: "Không thể truy cập",
  robots: {index: false, follow: false}
};
export default async function TrangBiChan({searchParams}: {searchParams: Promise<{c?: string}>}) {
  const {c} = await searchParams;
  const ma = (c ?? "").toUpperCase();
  return (
    <div className="mx-auto grid w-full max-w-xl flex-1 place-items-center px-4 py-16">
      <div className="sheet relative w-full border-2 border-danger p-6 pl-9 shadow-lift sm:p-8">
        <span className="absolute -right-3 -top-4 -rotate-6 border-2 border-danger bg-paper-light px-3 py-1 font-display text-sm font-bold uppercase tracking-[0.18em] text-danger shadow-stamp">
          Từ chối
        </span>
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-ink-faint">
          <IconSeal className="h-3.5 w-3.5 text-accent" />
          Kho đề THPT · kiểm tra khu vực
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          Kho đề chỉ mở trong <span className="text-accent">Việt Nam</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Hệ thống nhận diện mạng của cậu đang ở khu vực{" "}
          <b className="border border-ink/30 bg-paper px-1.5 py-0.5 font-mono text-ink">{ma || "không xác định"}</b>.
          Nếu cậu thật sự đang ở Việt Nam mà vẫn thấy trang này, rất có thể cậu đang bật VPN hoặc dùng mạng máy chủ — hãy tắt đi rồi tải lại trang.
        </p>
        <ul className="mt-4 space-y-1.5 border-t border-dashed border-ink/25 pt-4 text-sm text-ink-soft">
          <li>· Tắt VPN, proxy hoặc trình duyệt đang dùng mạng nước ngoài.</li>
          <li>· Đổi sang mạng điện thoại hoặc wifi gia đình rồi thử lại.</li>
          <li>· Vẫn bị chặn dù ở Việt Nam? Nhắn quản trị viên để mở khóa thủ công.</li>
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/" className="nut-nhan border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
            Thử lại trang chủ
          </Link>
          <a href="https://anhcoder999.github.io/" target="_blank" rel="noopener noreferrer" className="border border-ink/40 bg-paper-light px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent">
            Liên hệ quản trị
          </a>
        </div>
      </div>
    </div>
  );
}