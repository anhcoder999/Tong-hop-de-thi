"use client";
import {useState} from "react";
import {motion} from "framer-motion";
import {IconCheck, IconLoader, IconSeal} from "@/components/Icons";
import Turnstile from "@/components/Turnstile";
import {dangKy, dangNhap, guiLaiMa} from "@/app/actions";
import {buttonTap, fadeInUp, staggerContainer} from "@/lib/animations";
export default function TrangDangNhap() {
  const [cheDo, setCheDo] = useState<"nhap" | "ky">("nhap");
  const [choXacNhan, setChoXacNhan] = useState(false);
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [dangGui, setDangGui] = useState(false);
  const [bao, setBao] = useState<{kieu: "ok" | "loi"; text: string} | null>(null);
  const gui = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dangGui) return;
    if (!email.trim() || !matKhau) {
      setBao({kieu: "loi", text: "Nhập đủ email và mật khẩu."});
      return;
    }
    if (!token) {
      setBao({kieu: "loi", text: "Hoàn thành xác thực Turnstile trước đã."});
      return;
    }
    setDangGui(true);
    setBao(null);
    const kq = cheDo === "nhap" ? await dangNhap(email.trim(), matKhau, token) : await dangKy(email.trim(), matKhau, hoTen.trim(), token);
    if (kq.ok) {
      if (cheDo === "ky" && kq.canXacNhan) {
        setChoXacNhan(true);
        setBao({kieu: "ok", text: "Đã gửi link xác minh vào email cậu. Mở mail, bấm link, rồi quay lại đây đăng nhập."});
        setDangGui(false);
        setResetKey((k) => k + 1);
        setToken(null);
        return;
      }
      setBao({kieu: "ok", text: cheDo === "nhap" ? "Đăng nhập thành công, đang vào kho..." : "Tạo tài khoản thành công, đang vào kho..."});
      window.location.assign("/");
      return;
    }
    setBao({kieu: "loi", text: kq.error ?? "Có lỗi xảy ra."});
    setResetKey((k) => k + 1);
    setToken(null);
    setDangGui(false);
  };
  const guiLai = async () => {
    if (dangGui) return;
    setDangGui(true);
    const kq = await guiLaiMa(email.trim());
    setBao(kq.ok ? {kieu: "ok", text: "Đã gửi lại email xác minh, kiểm tra cả hộp thư rác nhé."} : {kieu: "loi", text: kq.error ?? "Không gửi lại được."});
    setDangGui(false);
  };
  if (choXacNhan) {
    return (
      <div className="mx-auto grid w-full max-w-md flex-1 place-items-center px-4 py-12">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full">
          <motion.div variants={fadeInUp} className="sheet border-2 border-ink bg-paper-light p-6 shadow-lift sm:p-8">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              <IconSeal className="h-4 w-4 text-accent" />
              Xác minh email
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">Kiểm tra hộp thư</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Link xác minh đã gửi tới <b className="text-ink">{email}</b>. Bấm vào link đó rồi quay lại trang này đăng nhập là xong. Không thấy mail thì nhìn trong mục thư rác.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <motion.button whileTap={buttonTap} type="button" onClick={() => void guiLai()} disabled={dangGui} className="nut-nhan flex items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-60">
                {dangGui ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconSeal className="h-4 w-4" />}
                Gửi lại email xác minh
              </motion.button>
              <motion.button whileTap={buttonTap} type="button" onClick={() => {
                setChoXacNhan(false);
                setCheDo("nhap");
                setBao(null);
              }} className="flex items-center justify-center gap-2 border border-ink/40 bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent">
                <IconCheck className="h-4 w-4" />
                Đã xác minh, vào đăng nhập
              </motion.button>
            </div>
            {bao && <p className={`mt-4 border p-2.5 text-xs ${bao.kieu === "loi" ? "border-danger/60 bg-danger/10 text-danger" : "border-ok/60 bg-ok/10 text-ok"}`}>{bao.text}</p>}
          </motion.div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="mx-auto grid w-full max-w-md flex-1 place-items-center px-4 py-12">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full">
        <motion.div variants={fadeInUp} className="sheet border-2 border-ink bg-paper-light p-6 shadow-lift sm:p-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            <IconSeal className="h-4 w-4 text-accent" />
            Kho đề THPT
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
            {cheDo === "nhap" ? "Đăng nhập" : "Tạo tài khoản"}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Thành viên được xem và tải toàn bộ kho đề. Quản trị viên có thêm quyền tải đề, ghim đề và đăng thông báo.</p>
          <div className="mt-5 grid grid-cols-2 border border-ink/30">
            {(["nhap", "ky"] as const).map((c) => (
              <button key={c} type="button" onClick={() => {
                setCheDo(c);
                setBao(null);
              }} className={`py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${cheDo === c ? "bg-ink text-paper-light" : "bg-paper text-ink-soft hover:text-ink"}`}>
                {c === "nhap" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>
          <form onSubmit={gui} className="mt-5 space-y-4">
            {cheDo === "ky" && (
              <div>
                <label htmlFor="hoten" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Tên hiển thị</label>
                <input id="hoten" type="text" value={hoTen} onChange={(e) => setHoTen(e.target.value)} maxLength={60} placeholder="VD: Anh Lusilfer" className="w-full border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="ban@email.com" className="w-full border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
            </div>
            <div>
              <label htmlFor="matkhau" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Mật khẩu</label>
              <input id="matkhau" type="password" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} autoComplete={cheDo === "nhap" ? "current-password" : "new-password"} placeholder="••••••••" className="w-full border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
            </div>
            <Turnstile onChange={setToken} resetKey={resetKey} />
            <motion.button whileTap={buttonTap} type="submit" disabled={dangGui} className="nut-quet flex w-full items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-50">
              {dangGui ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconSeal className="h-4 w-4" />}
              {dangGui ? "Đang xử lý..." : cheDo === "nhap" ? "Đăng nhập" : "Tạo tài khoản"}
            </motion.button>
            {cheDo === "ky" && <p className="text-[11px] leading-relaxed text-ink-faint">Đăng ký sẽ gửi link xác minh về email, bấm link rồi mới đăng nhập được. Mỗi IP tạo tối đa 5 tài khoản, chỉ nhận mạng tại Việt Nam, không nhận VPN hay mạng máy chủ.</p>}
            {bao && <p className={`border p-2.5 text-xs ${bao.kieu === "loi" ? "border-danger/60 bg-danger/10 text-danger" : "border-ok/60 bg-ok/10 text-ok"}`}>{bao.text}</p>}
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}