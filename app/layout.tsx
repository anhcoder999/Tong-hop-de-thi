import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import "./globals.css";
// Font Inter tự host qua next/font, subset vietnamese để dấu tiếng Việt hiển thị chuẩn
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});
// SEO mặc định cho toàn site, trang con sẽ ghi đè bằng template %s
export const metadata: Metadata = {
  metadataBase: new URL("https://tong-hop-de-thi.vercel.app"),
  title: {
    default: "Website Tổng Hợp Đề Thi - Kho đề ôn luyện miễn phí",
    template: "%s | Tổng Hợp Đề Thi",
  },
  description:
    "Kho đề thi Toán, Văn, Anh, Sử, Địa, KTPL chọn lọc, xem PDF trực tiếp và tải miễn phí, tối ưu cho điện thoại.",
  keywords: ["đề thi", "đề thi thử", "THPT", "Toán", "Văn", "Anh", "Sử", "Địa", "KTPL", "ôn thi"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Website Tổng Hợp Đề Thi",
    title: "Website Tổng Hợp Đề Thi",
    description: "Kho đề thi chọn lọc, xem và tải PDF miễn phí ngay trên điện thoại.",
  },
  robots: { index: true, follow: true },
};
// Màu thanh địa chỉ trình duyệt mobile trùng màu thương hiệu
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B82F6",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans text-slate-800 antialiased">
        <Navbar />
        {/* PageTransition keyed theo route: mỗi lần chuyển trang đều fade + trượt lên */}
        <PageTransition>{children}</PageTransition>
        <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white">
                <GraduationCap size={16} />
              </span>
              <span className="text-sm font-semibold">Website Tổng Hợp Đề Thi</span>
            </div>
            <nav className="flex items-center gap-4 text-sm text-slate-500">
              <Link href="/" className="transition-colors hover:text-brand-600">
                Trang chủ
              </Link>
              <Link href="/admin" className="transition-colors hover:text-brand-600">
                Admin
              </Link>
            </nav>
            <p className="text-xs text-slate-400">© 2026 Tổng Hợp Đề Thi - Học đều mỗi ngày.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}