"use client";
import {IconAlert} from "@/components/Icons";
export default function GlobalError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  return (
    <html lang="vi">
      <body style={{margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#F3EDE2", color: "#1F1A14", fontFamily: "system-ui, sans-serif", padding: "1rem"}}>
        <div style={{maxWidth: "32rem", border: "2px solid #B3261E", background: "#FAF6EE", padding: "2rem", textAlign: "center"}}>
          <IconAlert className="mx-auto h-10 w-10" />
          <p style={{fontSize: "3rem", fontWeight: 700, color: "#B3261E", margin: "0.5rem 0"}}>500</p>
          <h1 style={{fontSize: "1.4rem", margin: "0 0 0.5rem"}}>Lỗi hệ thống</h1>
          <p style={{fontSize: "0.9rem", opacity: 0.75}}>Ứng dụng gặp lỗi nghiêm trọng khi khởi động. Hãy tải lại trang.</p>
          {error.digest && <p style={{fontFamily: "monospace", fontSize: "0.7rem", opacity: 0.6}}>mã lỗi: {error.digest}</p>}
          <button type="button" onClick={reset} style={{marginTop: "1.25rem", border: "1px solid #1F1A14", background: "#1F1A14", color: "#FAF6EE", padding: "0.6rem 1.4rem", fontWeight: 600, cursor: "pointer"}}>Tải lại</button>
        </div>
      </body>
    </html>
  );
}