/** @type {import('next').NextConfig} */
// Cấu hình Next.js: bật strict mode để bắt lỗi React sớm, ẩn header lộ framework
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};
module.exports = nextConfig;