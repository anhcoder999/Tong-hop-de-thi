import {NextResponse, type NextRequest} from "next/server";
const DUONG_BO_QUA = ["/bi-chan"];
export function proxy(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();
  if (process.env.BO_CHAN_QUOC_GIA === "1") return NextResponse.next();
  const duong = req.nextUrl.pathname;
  if (DUONG_BO_QUA.some((p) => duong.startsWith(p))) return NextResponse.next();
  const quocGia = (req.headers.get("x-vercel-ip-country") ?? "").toUpperCase();
  if (!quocGia) return NextResponse.next();
  if (quocGia === "VN") {
    const res = NextResponse.next();
    res.headers.set("x-kho-de-quoc-gia", quocGia);
    return res;
  }
  console.log(`[chan-truy-cap] quoc_gia=${quocGia} duong=${duong}`);
  return NextResponse.rewrite(new URL(`/bi-chan?c=${encodeURIComponent(quocGia)}`, req.url));
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|avatar.jpg|.*\\.(?:png|jpe?g|svg|webp|gif|ico|css|js|map|woff2?)$).*)"]
};