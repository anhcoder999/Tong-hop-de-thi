import type {Metadata, Viewport} from "next";
import {Be_Vietnam_Pro, Lexend} from "next/font/google";
import Link from "next/link";
import {MotionConfig} from "framer-motion";
import {IconSeal} from "@/components/Icons";
import Ambient from "@/components/Ambient";
import Shield from "@/components/Shield";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import ThongBaoPopup from "@/components/ThongBaoPopup";
import {AuthProvider} from "@/lib/auth";
import "./globals.css";
const display = Lexend({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});
const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});
export const metadata: Metadata = {
  metadataBase: new URL("https://deontap-one.vercel.app"),
  title: {
    default: "Đề.Thi — Kho đề thi THPT kèm đáp án",
    template: "%s | Đề.Thi"
  },
  description: "Kho đề thi THPT mười hai môn, đề và đáp án tách riêng, đọc PDF ngay trên điện thoại, thi thử có chấm điểm tự động.",
  keywords: ["đề thi", "đáp án", "thi thử", "THPT", "Toán", "Văn", "Anh", "Sử", "Địa", "KTPL", "ôn thi"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Đề.Thi",
    title: "Đề.Thi — Kho đề thi THPT kèm đáp án",
    description: "Đề và đáp án tách riêng, đọc PDF ngay trên điện thoại, thi thử như thi thật."
  },
  robots: {index: true, follow: true}
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    {media: "(prefers-color-scheme: light)", color: "#F7F8FA"},
    {media: "(prefers-color-scheme: dark)", color: "#0C0E11"}
  ]
};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans text-ink antialiased">
        <script dangerouslySetInnerHTML={{__html: "try{if(localStorage.getItem('dethi.theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}"}} />
        <Ambient />
        <MotionConfig reducedMotion="user" transition={{type: "spring", stiffness: 320, damping: 30, mass: 0.6}}>
          <AuthProvider>
            <Shield />
            <Navbar />
            <main className="flex-1 pt-[66px] pb-20 md:pb-0">
              <PageTransition>{children}</PageTransition>
            </main>
            <ThongBaoPopup />
            <footer className="border-t border-ink/10 bg-paper-light/70 pb-20 md:pb-0">
              <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-field bg-accent-wash text-accent">
                    <IconSeal className="h-4 w-4" />
                  </span>
                  <span className="font-display text-base font-bold tracking-tight">
                    Đề<span className="text-accent">.</span>Thi
                  </span>
                </div>
                <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-ink-soft">
                  <Link href="/" className="transition-colors hover:text-accent">Trang chủ</Link>
                  <Link href="/kho-de" className="transition-colors hover:text-accent">Kho đề</Link>
                  <Link href="/thi-thu" className="transition-colors hover:text-accent">Thi thử</Link>
                  <Link href="/tai-khoan" className="transition-colors hover:text-accent">Tài khoản</Link>
                </nav>
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">© 2026 Đề.Thi</p>
              </div>
            </footer>
          </AuthProvider>
        </MotionConfig>
      </body>
    </html>
  );
}