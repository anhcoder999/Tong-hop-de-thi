const nextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb"
    }
  },
  images: {
    remotePatterns: [{protocol: "https", hostname: "**.supabase.co"}]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains"},
          {key: "X-Content-Type-Options", value: "nosniff"},
          {key: "X-Frame-Options", value: "DENY"},
          {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
          {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"},
          {key: "Cross-Origin-Opener-Policy", value: "same-origin"},
          {key: "Cross-Origin-Resource-Policy", value: "same-origin"}
        ]
      }
    ];
  },
  webpack: (config, {isServer}) => {
    config.resolve.alias = {...config.resolve.alias, canvas: false, "@napi-rs/canvas": false};
    if (!isServer) config.resolve.fallback = {...config.resolve.fallback, fs: false, path: false};
    return config;
  }
};
module.exports = nextConfig;