const GIU_NGUYEN = ["lồn", "lon", "l0n", "địt", "dit", "djt", "bướm", "buom", "cu", "cặc", "cac", "cak", "dái", "đụ", "buồi", "boi", "đm", "dm", "dmm", "vl", "vcl", "cc", "cmm", "lol", "loz", "lôz"];
const BO_DAU = ["lon", "l0n", "dit", "djt", "buom", "cu", "cac", "cak", "dai", "dm", "dmm", "vl", "vcl", "cc", "cmm", "lol", "loz", "boi"];
const LEET: Record<string, string> = {"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "6": "g", "7": "t", "8": "b", "9": "g", "@": "a", "$": "s"};
function haChuoi(raw: string): string {
  return raw.toLowerCase().replace(/[0-9@$/\\]/g, (k) => LEET[k] ?? k);
}
function boDau(raw: string): string {
  return haChuoi(raw).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z]/g, "");
}
function tachToken(raw: string): string[] {
  return raw.toLowerCase().split(/[^a-z0-9à-ỹ]+/i).filter(Boolean);
}
export function kiemTraToxic(raw: string): string | null {
  const text = raw.toLowerCase();
  for (const w of GIU_NGUYEN) {
    if (w.length >= 3 && text.includes(w)) return w;
  }
  const tokens = tachToken(raw);
  for (const t of tokens) {
    if (GIU_NGUYEN.includes(t)) return t;
    const b = boDau(t);
    if (BO_DAU.includes(b)) return t;
  }
  return null;
}