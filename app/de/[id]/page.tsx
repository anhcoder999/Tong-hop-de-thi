import {getAuthClient, getSupabaseClient} from "@/lib/supabase/factory";
import {notFound} from "next/navigation";
import {PdfViewer} from "@/components/PdfViewer";
interface PageProps {
  params: {id: string};
}
export default async function DePage({params}: PageProps) {
  const auth = getAuthClient();
  const {data: {session}} = await auth.auth.getSession();
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">🔒 Cần đăng nhập</h1>
          <p className="text-white/80">Vui lòng đăng nhập để xem đề thi</p>
        </div>
      </div>
    );
  }
  const {data: de, error} = await auth.from("de_thi").select("*").eq("id", params.id).single();
  if (error || !de) notFound();
  const storage = getSupabaseClient(de.mon, session.access_token);
  const {data: signedUrlData, error: urlError} = await storage.storage.from("de-thi").createSignedUrl(de.storage_path, 3600);
  if (urlError || !signedUrlData?.signedUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">❌ Lỗi</h1>
          <p className="text-white/80">Không thể tạo link xem PDF</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">{de.tieu_de}</h1>
          <div className="flex gap-2 text-white/80 text-sm">
            <span className="px-3 py-1 bg-white/20 rounded-full">{de.mon}</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">{de.nam}</span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
          <PdfViewer url={signedUrlData.signedUrl} />
        </div>
      </div>
    </div>
  );
}