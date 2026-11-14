import JSZip from "jszip";
const cache = new Map<string, string>();
const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="26"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style></w:styles>`;
function body(tieuDe: string): string {
  const p = (t: string, bold = false) =>
    `<w:p><w:r><w:rPr>${bold ? "<w:b/>" : ""}</w:rPr><w:t xml:space="preserve">${t}</w:t></w:r></w:p>`;
  const cell = (t: string) => `<w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>${p(t)}</w:tc>`;
  const row = (a: string, b: string) => `<w:tr>${cell(a)}${cell(b)}</w:tr>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${p(tieuDe, true)}${p("Câu 1. Cho hàm số y = x³ - 3x + 2. Khảo sát sự biến thiên và vẽ đồ thị hàm số.")}${p("Câu 2. Giải phương trình: log₂(x + 1) + log₂(x - 1) = 3.")}${p("Bảng phân bố điểm câu hỏi:")}${`<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>${row("Mức độ", "Số câu")}${row("Nhận biết", "10")}${row("Thông hiểu", "8")}${row("Vận dụng", "6")}${row("Vận dụng cao", "4")}</w:tbl>`}${p("Hết đề. Học sinh không được sử dụng tài liệu.")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
}
export async function taoDocxMau(seed: string): Promise<Blob> {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", RELS);
  zip.file("word/_rels/document.xml.rels", DOC_RELS);
  zip.file("word/styles.xml", STYLES);
  zip.file("word/document.xml", body(seed === "demo-docx:van" ? "ĐỀ MINH HỌA NGỮ VĂN - ĐỊNH DẠNG DOCX" : "ĐỀ MINH HỌA TOÁN - ĐỊNH DẠNG DOCX"));
  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}
export async function resolveUrl(url: string): Promise<string> {
  if (!url.startsWith("demo-docx")) return url;
  const hit = cache.get(url);
  if (hit) return hit;
  const blob = await taoDocxMau(url);
  const u = URL.createObjectURL(blob);
  cache.set(url, u);
  return u;
}