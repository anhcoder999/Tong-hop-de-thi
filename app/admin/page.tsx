import RequireAdmin from "@/components/RequireAdmin";
import AdminTabs from "@/components/AdminTabs";
export default function TrangAdmin() {
  return (
    <RequireAdmin>
      <AdminTabs />
    </RequireAdmin>
  );
}