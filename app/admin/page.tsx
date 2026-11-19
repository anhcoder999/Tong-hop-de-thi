import RequireAdmin from "@/components/RequireAdmin";
import Dashboard from "@/components/Dashboard";
import AdminPanel from "@/components/AdminPanel";
import ThiThuAdmin from "@/components/ThiThuAdmin";
import GhimDe from "@/components/GhimDe";
import ThongBaoAdmin from "@/components/ThongBaoAdmin";
import BinhLuanAdmin from "@/components/BinhLuanAdmin";
import NguoiDungAdmin from "@/components/NguoiDungAdmin";
export default function TrangAdmin() {
  return (
    <RequireAdmin>
      <Dashboard />
      <AdminPanel />
      <ThiThuAdmin />
      <GhimDe />
      <ThongBaoAdmin />
      <BinhLuanAdmin />
      <NguoiDungAdmin />
    </RequireAdmin>
  );
}