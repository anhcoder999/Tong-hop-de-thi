import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {IconCalendar, IconChevron} from "@/components/Icons";
import DocumentViewer from "@/components/DocumentViewer";
import {chuanMon, formatDungLuong, formatNgay, MON_DAY_DU, tenNhom, type DeThi, type Loai} from "@/lib/data";
import {authClient, BUCKET, hubClient, hubCuaPath} from "@/lib/server";
export const dynamic = "force-dynamic";
interface Props {
  params: {id: string};
}
async function layDe(id: string): Promise<DeThi | null> {
  if (!/^[0-9a-fA-F-]{8,}$/.test(id)) return null;
  const {data: r} = await hubClient("MAIN").from("de_thi").select("*").eq("id", id).maybeSingle();
  if (!r) return null;
  return {
    id: String(r.id),
    mon: chuanMon(String(r.mon ?? "")),
    ten: String(r.ten),
    ngay: String(r.ngay),
    urlPdf: String(r.url_file),
    loai: (r.loai === "docx" ? "docx" : "pdf") as Loai,
    duongDan: (r.duong_dan as string | null) ?? null,
    kichThuoc: typeof r.kich_thuoc === "number" ? r.kich_thuoc : null,
    tenGoc: (r.ten_goc as string | null) ?? null
  };
}
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const de = await layDe(params.id);
  if (!de) return {title: "Không tìm thấy đề"};
  const moTa = `Xem và tải ${de.ten} - môn ${MON_DAY_DU[de.mon]}, cập nhật ngày ${formatNgay(de.ngay)}.`;
  return {title: de.ten, description: moTa, openGraph: {title: de.ten, description: moTa, type: "article"}};
}
export default async function TrangXemDe({params}: Props) {
  const {data, error} = await authClient().auth.getClaims();
  if (error || !data?.claims) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-xl px-4 pb-16 pt-16">
        <div className="sheet p-6 pl-9 shadow-paper">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Cần đăng nhập</h1>
          <p className="mt-3 text-sm text-ink-soft">Kho đề chỉ mở cho thành viên. Đăng nhập để xem và tải đề thi nhé.</p>
          <Link href="/login" className="mt-5 inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
            Đăng nhập
            <IconChevron className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }
  const de = await layDe(params.id);
  if (!de) notFound();
  let url = de.urlPdf;
  if (de.duongDan) {
    const {data: signed} = await hubClient(hubCuaPath(de.duongDan)).storage.from(BUCKET).createSignedUrl(de.duongDan, 3600);
    if (signed?.signedUrl) url = signed.signedUrl;
  }
  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-16 pt-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-soft">
        <Link href="/" className="underline-offset-4 transition-colors hover:text-accent hover:underline hover:decoration-wavy">
          Trang chủ
        </Link>
        <IconChevron className="h-3 w-3 text-ink-faint" />
        <span>{tenNhom(de.mon)}</span>
        <IconChevron className="h-3 w-3 text-ink-faint" />
        <span title={MON_DAY_DU[de.mon]}>{de.mon}</span>
        <IconChevron className="h-3 w-3 text-ink-faint" />
        <span className="max-w-[14rem] truncate text-ink">{de.ten}</span>
      </nav>
      <header className="mt-4 border-b-2 border-ink pb-5">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{de.ten}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span title={MON_DAY_DU[de.mon]} className="-rotate-2 border border-accent/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {de.mon}
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">{MON_DAY_DU[de.mon]}</span>
          <span className="border border-ink/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{de.loai === "docx" ? "DOCX" : "PDF"}</span>
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-faint">
            <IconCalendar className="h-3.5 w-3.5" />
            {formatNgay(de.ngay)}
          </span>
          <span className="text-xs uppercase tracking-[0.12em] text-ink-faint">{formatDungLuong(de.kichThuoc)}</span>
        </div>
      </header>
      <DocumentViewer url={url} ten={de.ten} loai={de.loai} />
    </div>
  );
}