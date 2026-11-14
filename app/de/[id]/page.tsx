import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight } from "lucide-react";
import PdfViewer from "@/components/PdfViewer";
import { DS_DE, formatNgay, timDeTheoId } from "@/lib/data";
interface Props {
  params: { id: string };
}
// Pre-render sẵn 10 đề mẫu lúc build, trang xem đề tải tức thì
export function generateStaticParams() {
  return DS_DE.map((d) => ({ id: d.id }));
}
// SEO động theo từng đề: tiêu đề, mô tả, openGraph
export function generateMetadata({ params }: Props): Metadata {
  const de = timDeTheoId(params.id);
  if (!de) return { title: "Không tìm thấy đề" };
  const moTa = `Xem và tải miễn phí ${de.ten} - môn ${de.mon}, cập nhật ngày ${formatNgay(de.ngay)}.`;
  return {
    title: de.ten,
    description: moTa,
    openGraph: { title: de.ten, description: moTa, type: "article" },
  };
}
export default function TrangXemDe({ params }: Props) {
  const de = timDeTheoId(params.id);
  // ID lạ thì trả về trang 404 chuẩn của Next.js
  if (!de) notFound();
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-brand-600">
          Trang chủ
        </Link>
        <ChevronRight size={14} className="text-slate-300" />
        <span>{de.mon}</span>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="max-w-[16rem] truncate font-medium text-slate-800">{de.ten}</span>
      </nav>
      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{de.ten}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Môn {de.mon}</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays size={15} />
            Đăng ngày {formatNgay(de.ngay)}
          </span>
        </div>
      </header>
      {/* Khung xem PDF kèm toolbar Tải PDF / Quay lại, có skeleton khi tải */}
      <PdfViewer url={de.urlPdf} ten={de.ten} />
    </div>
  );
}
