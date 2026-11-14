import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconCalendar, IconChevron } from "@/components/Icons";
import DocumentViewer from "@/components/DocumentViewer";
import { DS_DE, formatNgay, timDeTheoId } from "@/lib/data";
interface Props {
  params: { id: string };
}
export function generateStaticParams() {
  return DS_DE.map((d) => ({ id: d.id }));
}
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
  if (!de) notFound();
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-soft">
        <Link href="/" className="underline-offset-4 transition-colors hover:text-accent hover:underline hover:decoration-wavy">
          Trang chủ
        </Link>
        <IconChevron className="h-3 w-3 text-ink-faint" />
        <span>{de.mon}</span>
        <IconChevron className="h-3 w-3 text-ink-faint" />
        <span className="max-w-[16rem] truncate text-ink">{de.ten}</span>
      </nav>
      <header className="mt-4 border-b-2 border-ink pb-5">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{de.ten}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="-rotate-2 border border-accent/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Môn {de.mon}
          </span>
          <span className="border border-ink/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {de.loai === "docx" ? "DOCX" : "PDF"}
          </span>
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-faint">
            <IconCalendar className="h-3.5 w-3.5" />
            Đăng ngày {formatNgay(de.ngay)}
          </span>
        </div>
      </header>
      <DocumentViewer url={de.urlPdf} ten={de.ten} loai={de.loai} />
    </div>
  );
}