import type {Metadata, Viewport} from "next";
import {Be_Vietnam_Pro, Lora} from "next/font/google";
import Link from "next/link";
import {IconSeal} from "@/components/Icons";
import Ambient from "@/components/Ambient";
import Shield from "@/components/Shield";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import ThongBaoPopup from "@/components/ThongBaoPopup";
import {AuthProvider} from "@/lib/auth";
import "./globals.css";
const lora = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap"
});
const be = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be",
  display: "swap"
});
export const metadata: Metadata = {
  metadataBase: new URL("https://deontap-one.vercel.app"),
  title: {
    default: "Đề.Thi — Tổng hợp đề thi THPT",
    template: "%s | Đề.Thi"
  },
  description: "Kho đề thi THPT kèm đáp án, xem PDF trực tiếp và tải miễn phí, tối ưu cho điện thoại.",
  keywords: ["đề thi", "đáp án", "đề thi thử", "THPT", "Toán", "Văn", "Anh", "Sử", "Địa", "KTPL", "ôn thi"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Đề.Thi",
    title: "Đề.Thi — Tổng hợp đề thi THPT",
    description: "Kho đề thi chọn lọc kèm đáp án, xem và tải PDF miễn phí ngay trên điện thoại."
  },
  robots: {index: true, follow: true}
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFFFF"
};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className={`${lora.variable} ${be.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans text-ink antialiased">
        <script dangerouslySetInnerHTML={{__html: "try{if(localStorage.getItem('dethi.theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}"}} />
        <Ambient />
        <AuthProvider>
          <Shield />
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <ThongBaoPopup />
          <footer className="border-t-2 border-ink bg-paper-light/70">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center border border-ink/40 text-ink">
                  <IconSeal className="h-4 w-4" />
                </span>
                <span className="font-display text-base font-bold">
                  Đề<span className="text-accent">.</span>Thi
                </span>
              </div>
              <nav className="flex items-center gap-5 text-sm text-ink-soft">
                <Link href="/" className="underline-offset-4 transition-colors hover:text-accent hover:underline hover:decoration-wavy">Trang chủ</Link>
                <Link href="/tai-khoan" className="underline-offset-4 transition-colors hover:text-accent hover:underline hover:decoration-wavy">Tài khoản</Link>
              </nav>
              <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">© 2026 Đề.Thi</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}