import type { ReactNode } from "react";
import type { Mon } from "@/lib/data";
type P = { className?: string };
function S({ c, children }: { c?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={c ?? "h-5 w-5"}>
      {children}
    </svg>
  );
}
export const IconSearch = ({ className }: P) => (
  <S c={className}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </S>
);
export const IconSearchX = ({ className }: P) => (
  <S c={className}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
    <path d="m8.5 8.5 4 4M12.5 8.5l-4 4" />
  </S>
);
export const IconClose = ({ className }: P) => (
  <S c={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </S>
);
export const IconArrowRight = ({ className }: P) => (
  <S c={className}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </S>
);
export const IconArrowLeft = ({ className }: P) => (
  <S c={className}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </S>
);
export const IconDownload = ({ className }: P) => (
  <S c={className}>
    <path d="M12 3v11" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 20h16" />
  </S>
);
export const IconExternal = ({ className }: P) => (
  <S c={className}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M19 14v6H4V5h6" />
  </S>
);
export const IconUpload = ({ className }: P) => (
  <S c={className}>
    <path d="M12 15V4" />
    <path d="m7 8 5-5 5 5" />
    <path d="M4 20h16" />
  </S>
);
export const IconTrash = ({ className }: P) => (
  <S c={className}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="m6 7 1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </S>
);
export const IconEdit = ({ className }: P) => (
  <S c={className}>
    <path d="m4 20 1-4L16 5l3 3L8 19l-4 1Z" />
    <path d="m14 7 3 3" />
  </S>
);
export const IconPlus = ({ className }: P) => (
  <S c={className}>
    <path d="M12 5v14M5 12h14" />
  </S>
);
export const IconCheck = ({ className }: P) => (
  <S c={className}>
    <path d="m5 13 4 4L19 7" />
  </S>
);
export const IconAlert = ({ className }: P) => (
  <S c={className}>
    <path d="M12 4 2 20h20L12 4Z" />
    <path d="M12 10v4" />
    <path d="M12 17.5v.5" />
  </S>
);
export const IconCalendar = ({ className }: P) => (
  <S c={className}>
    <rect x="4" y="6" width="16" height="14" />
    <path d="M4 10h16" />
    <path d="M9 4v4M15 4v4" />
  </S>
);
export const IconChevron = ({ className }: P) => (
  <S c={className}>
    <path d="m9 6 6 6-6 6" />
  </S>
);
export const IconFile = ({ className }: P) => (
  <S c={className}>
    <path d="M6 3h8l4 4v14H6Z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6M9 16h6" />
  </S>
);
export const IconLoader = ({ className }: P) => (
  <S c={className}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </S>
);
export const IconRefresh = ({ className }: P) => (
  <S c={className}>
    <path d="M20 12a8 8 0 1 1-2.4-5.7" />
    <path d="M20 4v4h-4" />
  </S>
);
export const IconUndo = ({ className }: P) => (
  <S c={className}>
    <path d="M4 9h11a5 5 0 0 1 0 10H9" />
    <path d="M8 5 4 9l4 4" />
  </S>
);
export const IconSort = ({ className }: P) => (
  <S c={className}>
    <path d="M7 4v16M7 20l-3-3M7 20l3-3" />
    <path d="M14 7h7M14 12h5M14 17h3" />
  </S>
);
export const IconEye = ({ className }: P) => (
  <S c={className}>
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="2.6" />
  </S>
);
export const IconSeal = ({ className }: P) => (
  <S c={className}>
    <path d="M5 3h10l4 4v14H5Z" />
    <path d="M15 3v4h4" />
    <g className="text-accent">
      <circle cx="12" cy="14" r="3.4" />
      <path d="M12 10.6v6.8M8.6 14h6.8" />
    </g>
  </S>
);
export const InkLine = ({ className }: P) => (
  <svg viewBox="0 0 120 8" preserveAspectRatio="none" fill="none" aria-hidden="true" className={className ?? "h-2 w-full"}>
    <path d="M2 5C20 2 38 7 58 4S96 6 118 3" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
  </svg>
);
const IconToan = ({ className }: P) => (
  <S c={className}>
    <path d="M4 20V5l15 15Z" />
    <path d="M8 16v-3M11 16v-1.5" />
    <path d="M14.5 8.5h5M17 6v5" />
  </S>
);
const IconLi = ({ className }: P) => (
  <S c={className}>
    <circle cx="12" cy="12" r="2.1" />
    <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(30 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-30 12 12)" />
  </S>
);
const IconHoa = ({ className }: P) => (
  <S c={className}>
    <path d="M9 3h6" />
    <path d="M10 3v6l-4.6 9.2A1.6 1.6 0 0 0 6.8 21h10.4a1.6 1.6 0 0 0 1.4-2.8L14 9V3" />
    <path d="M7.2 15h9.6" />
    <path d="M11 18h.5M13.5 17h.5" />
  </S>
);
const IconSinh = ({ className }: P) => (
  <S c={className}>
    <path d="M8 3c4 3 4 6 0 9s-4 6 0 9" />
    <path d="M16 3c-4 3-4 6 0 9s4 6 0 9" />
    <path d="M9.2 7h5.6M8.4 12h7.2M9.2 17h5.6" />
  </S>
);
const IconVan = ({ className }: P) => (
  <S c={className}>
    <path d="M12 6c-2-1.6-4.5-2-8-2v14c3.5 0 6 .4 8 2 2-1.6 4.5-2 8-2V4c-3.5 0-6 .4-8 2Z" />
    <path d="M12 6v14" />
    <path d="M7 9h3M7 12h3M14 9h3M14 12h3" />
  </S>
);
const IconSu = ({ className }: P) => (
  <S c={className}>
    <path d="M4 9 12 4l8 5" />
    <path d="M5 9v8M10 9v8M14 9v8M19 9v8" />
    <path d="M4 17h16" />
    <path d="M3 20h18" />
  </S>
);
const IconDia = ({ className }: P) => (
  <S c={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c3 2.6 3 14.4 0 17-3-2.6-3-14.4 0-17Z" />
  </S>
);
const IconAnh = ({ className }: P) => (
  <S c={className}>
    <path d="M4 5h16v11H10l-4 4v-4H4Z" />
    <path d="m9.5 13 2.5-6 2.5 6" />
    <path d="M10.4 11h3.2" />
  </S>
);
const IconKtpl = ({ className }: P) => (
  <S c={className}>
    <path d="M12 4v16" />
    <path d="M8 20h8" />
    <path d="M5 7h14" />
    <path d="M5 7 2.5 13h5L5 7Z" />
    <path d="M2.5 13a2.5 2.5 0 0 0 5 0" />
    <path d="M19 7l-2.5 6h5L19 7Z" />
    <path d="M16.5 13a2.5 2.5 0 0 0 5 0" />
  </S>
);
const IconTin = ({ className }: P) => (
  <S c={className}>
    <rect x="3" y="4" width="18" height="13" />
    <path d="M9 21h6M12 17v4" />
    <path d="M9.6 8.6 7.6 10.6l2 2M14.4 8.6l2 2-2 2" />
  </S>
);
const IconCn = ({ className }: P) => (
  <S c={className}>
    <circle cx="12" cy="12" r="7.4" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9" />
  </S>
);
const IconKhac = ({ className }: P) => (
  <S c={className}>
    <rect x="4" y="4" width="16" height="16" />
    <g fill="currentColor" stroke="none">
      <circle cx="8.6" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="15.4" cy="12" r="1" />
    </g>
  </S>
);
export function MonIcon({ mon, className }: { mon: Mon; className?: string }) {
  if (mon === "Toán") return <IconToan className={className} />;
  if (mon === "Văn") return <IconVan className={className} />;
  if (mon === "Anh") return <IconAnh className={className} />;
  if (mon === "Lí") return <IconLi className={className} />;
  if (mon === "Hóa") return <IconHoa className={className} />;
  if (mon === "Sinh") return <IconSinh className={className} />;
  if (mon === "Sử") return <IconSu className={className} />;
  if (mon === "Địa") return <IconDia className={className} />;
  if (mon === "KTPL") return <IconKtpl className={className} />;
  if (mon === "Tin") return <IconTin className={className} />;
  if (mon === "CN") return <IconCn className={className} />;
  return <IconKhac className={className} />;
}