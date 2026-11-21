const CDN = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69";
const CMAP = `${CDN}/cmaps/`;
const FONTS = `${CDN}/standard_fonts/`;
export async function nenPdf(file: File, onProgress?: (s: string) => void): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const {PDFDocument} = await import("pdf-lib");
  const src = await PDFDocument.load(bytes, {updateMetadata: false});
  const out = await PDFDocument.create();
  const doc = await pdfjs.getDocument({data: bytes.slice(), cMapUrl: CMAP, cMapPacked: true, standardFontDataUrl: FONTS}).promise;
  const n = doc.numPages;
  let soTrangNen = 0;
  for (let i = 0; i < n; i++) {
    onProgress?.(`Đang nén PDF trang ${i + 1}/${n}...`);
    const page = await doc.getPage(i + 1);
    const tc = await page.getTextContent();
    if (tc.items.length > 0) {
      const [copied] = await out.copyPages(src, [i]);
      out.addPage(copied);
    } else {
      const base = page.getViewport({scale: 1});
      const scale = Math.min(170 / 72, 2000 / Math.max(base.width, base.height));
      const vp = page.getViewport({scale});
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(vp.width));
      canvas.height = Math.max(1, Math.floor(vp.height));
      const ctx = canvas.getContext("2d", {alpha: false});
      if (!ctx) {
        const [copied] = await out.copyPages(src, [i]);
        out.addPage(copied);
        page.cleanup();
        continue;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({canvasContext: ctx, viewport: vp}).promise;
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
      canvas.width = 0;
      canvas.height = 0;
      if (!blob) {
        const [copied] = await out.copyPages(src, [i]);
        out.addPage(copied);
        page.cleanup();
        continue;
      }
      const jpg = await out.embedJpg(await blob.arrayBuffer());
      const p = out.addPage([base.width, base.height]);
      p.drawImage(jpg, {x: 0, y: 0, width: base.width, height: base.height});
      soTrangNen++;
    }
    page.cleanup();
  }
  await doc.destroy();
  if (soTrangNen === 0) return file;
  onProgress?.("Đang đóng gói file nén...");
  const saved = await out.save({useObjectStreams: true});
  const result = new Blob([new Uint8Array(saved)], {type: "application/pdf"});
  return result.size < file.size ? result : file;
}