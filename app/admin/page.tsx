import RequireAdmin from "@/components/RequireAdmin";
import AdminPanel from "@/components/AdminPanel";
import GhimDe from "@/components/GhimDe";
import ThongBaoAdmin from "@/components/ThongBaoAdmin";
export default function TrangAdmin() {
  return (
    <RequireAdmin>
      <AdminPanel />
      <GhimDe />
      <ThongBaoAdmin />
    </RequireAdmin>
  );
}