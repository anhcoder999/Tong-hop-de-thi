import RequireAdmin from "@/components/RequireAdmin";
import AdminPanel from "@/components/AdminPanel";
import GhimDe from "@/components/GhimDe";
import ThongBaoAdmin from "@/components/ThongBaoAdmin";
import NguoiDungAdmin from "@/components/NguoiDungAdmin";
export default function TrangAdmin() {
  return (
    <RequireAdmin>
      <AdminPanel />
      <GhimDe />
      <ThongBaoAdmin />
      <NguoiDungAdmin />
    </RequireAdmin>
  );
}