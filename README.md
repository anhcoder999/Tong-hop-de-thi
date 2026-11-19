# 📚 Đề.Thi — Kho đề thi THPT kèm đáp án

Website gom đề thi tốt nghiệp THPT: đọc PDF ngay trong trang, đáp án tách riêng từng đề, thi thử online chấm tự động. Tối ưu cho điện thoại.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase (Postgres + Auth + Storage) · pdf.js · pdf-lib · KaTeX · Cloudflare Turnstile.

## Tính năng

- **Trang chủ** (`/`): giới thiệu kho, số liệu đếm trực tiếp, mục lục 12 môn, đề vừa lên, thư gửi học sinh.
- **Kho đề** (`/kho-de`): tìm không dấu, lọc theo môn (dải môn dính dưới navbar), sắp xếp, đề ghim lên đầu, đếm lượt xem/tải, đánh dấu đã đọc (lưu trong máy).
- **Xem đề** (`/de/[id]`): PDF dựng theo độ phân giải màn hình, vuốt/chụm để chuyển trang và zoom, chạm đúp phóng to, tìm chữ trong đề (tô đỏ), ghim trang + ghi chú (localStorage), chế độ tập trung, đáp án mở riêng, tải PDF, chấm sao và nhận xét (quản trị duyệt).
- **Thi thử** (`/thi-thu`): đề soạn bằng chữ thường trộn LaTeX, ba dạng câu (trắc nghiệm A/B/C/D, đúng/sai 4 phát biểu, trả lời ngắn), đồng hồ đếm ngược, tự nộp khi hết giờ, rời phòng thi quá 3 lần bị 0 điểm, chấm tự động và xem lại lời giải, lịch sử thi.
- **Quản trị** (`/admin`): dashboard thống kê, tải đề PDF + đáp án (tự nén trước khi upload), ghim đề, thông báo popup, soạn đề thi online, duyệt nhận xét, khóa/mở khóa người dùng.
- Nền sáng/tối với hiệu ứng lan tròn từ nút bấm, chống sao chép/dán và mở công cụ gỡ lỗi, Turnstile ở đăng nhập và tải đề.

## Cấu trúc