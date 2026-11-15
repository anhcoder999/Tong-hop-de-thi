import RequireAdmin from "@/components/RequireAdmin";
import AdminPanel from "@/components/AdminPanel";
export default function TrangAdmin() {
  return (
    <RequireAdmin>
      <AdminPanel />
    </RequireAdmin>
  );
}