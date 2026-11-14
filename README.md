# 📚 Website Tổng Hợp Đề Thi

Website tổng hợp và xem đề thi online, tối ưu cho điện thoại. Xây bằng **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion**.

## ✨ Tính năng

- Trang chủ: tìm kiếm không dấu, lọc theo môn (Toán, Văn, Anh, Sử, Địa, KTPL), card xuất hiện lần lượt.
- Trang xem đề: xem PDF trực tiếp, tải về, breadcrumb, SEO riêng từng đề.
- Trang admin (demo): thêm / sửa / xóa đề, kéo thả PDF, dữ liệu lưu tạm trong RAM trình duyệt.
- Giao diện glassmorphism, gradient xanh `#3B82F6 → #1E40AF`, font Inter hỗ trợ tiếng Việt.

## 🖥️ Chạy trên máy tính (nếu có)

Yêu cầu Node.js >= 18.17.

    npm install
    npm run dev

Mở http://localhost:3000 để xem. Lệnh khác: `npm run build` (build), `npm start` (chạy bản build), `npm run lint` (kiểm tra lỗi).

## 📱 Deploy từ điện thoại (3 bước)

1. **Tạo file**: tạo đủ cây thư mục như bên dưới. Lưu ý thư mục `app/de/[id]` phải gõ đúng tên `[id]` gồm cả ngoặc vuông. File `next-env.d.ts` KHÔNG cần tạo, Next.js tự sinh khi build.
2. **Upload GitHub**: vào github.com → New repository → đặt tên `tong-hop-de-thi` → Create. Trong repo bấm **Add file → Create new file**, gõ đường dẫn ví dụ `app/de/[id]/page.tsx` (gõ dấu `/` sẽ tự tạo thư mục), paste nội dung file vào, bấm **Commit changes**. Lặp lại cho từng file.
3. **Deploy Vercel**: vào vercel.com → đăng nhập bằng GitHub → **Add New → Project** → chọn repo `tong-hop-de-thi` → Vercel tự nhận Next.js → bấm **Deploy**. Chờ 1-2 phút là có link chạy thật.

## 🗂️ Cấu trúc thư mục

    .eslintrc.json
    .gitignore
    README.md
    package.json
    tsconfig.json
    next.config.js
    tailwind.config.ts
    postcss.config.js
    app/
      globals.css
      layout.tsx
      page.tsx
      admin/page.tsx
      de/[id]/page.tsx
    components/
      Navbar.tsx
      PageTransition.tsx
      DeCard.tsx
      PdfViewer.tsx
      EmptyState.tsx
      Skeleton.tsx
    lib/
      data.ts
      animations.ts

## ⚠️ Lưu ý

- 10 đề trong `lib/data.ts` đang trỏ tới **PDF mẫu công khai** để demo. Thay `urlPdf` bằng link đề thật (host cùng domain trong thư mục `public/` hoặc link không chặn iframe).
- Trang admin chỉ là demo React state, tải lại trang là mất dữ liệu mới. Muốn lưu thật cần nối database (Vercel Postgres, Supabase...).
- Đổi `metadataBase` trong `app/layout.tsx` thành domain Vercel thật của bạn để SEO chuẩn.
- Một số trình duyệt Android không hiển thị PDF trong iframe, trang xem đề đã có nút Tải PDF / Mở tab mới để xử lý.