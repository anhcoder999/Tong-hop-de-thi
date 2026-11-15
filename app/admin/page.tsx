"use client";
import {useState} from "react";
import {uploadDeThi} from "./actions";
export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData(e.currentTarget);
    const result = await uploadDeThi(formData);
    if (result.ok) {
      setMessage("✅ Upload thành công!");
      e.currentTarget.reset();
    } else {
      setMessage(`❌ ${result.error}`);
    }
    setLoading(false);
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-900 p-4">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-8">
        <h1 className="text-3xl font-bold text-white mb-6">Admin - Upload Đề Thi</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Môn học</label>
            <select name="mon" required className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30">
              <option value="toan" className="text-black">Toán</option>
              <option value="van" className="text-black">Văn</option>
              <option value="anh" className="text-black">Anh</option>
              <option value="li" className="text-black">Lý</option>
              <option value="hoa" className="text-black">Hóa</option>
              <option value="sinh" className="text-black">Sinh</option>
              <option value="su" className="text-black">Sử</option>
              <option value="dia" className="text-black">Địa</option>
              <option value="ktpl" className="text-black">KTPL</option>
              <option value="tin" className="text-black">Tin</option>
              <option value="cong-nghe" className="text-black">Công Nghệ</option>
              <option value="khac" className="text-black">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-2">Tiêu đề</label>
            <input name="tieuDe" type="text" required minLength={3} maxLength={200}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 placeholder-white/50"
              placeholder="VD: Đề thi thử THPTQG 2026 môn Toán" />
          </div>
          <div>
            <label className="block text-white mb-2">Năm</label>
            <input name="nam" type="number" required min={2000} max={2027}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30"
              placeholder="2026" />
          </div>
          <div>
            <label className="block text-white mb-2">File PDF</label>
            <input name="file" type="file" accept="application/pdf" required
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-white/90 disabled:opacity-50">
            {loading ? "Đang upload..." : "Upload"}
          </button>
          {message && (
            <div className="p-3 rounded-lg bg-white/20 text-white text-center">{message}</div>
          )}
        </form>
      </div>
    </div>
  );
}