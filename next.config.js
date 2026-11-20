const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb"
    }
  },
  images: {
    remotePatterns: [{protocol: "https", hostname: "**.supabase.co"}]
  },
  webpack: (config, {isServer}) => {
    config.resolve.alias = {...config.resolve.alias, canvas: false, "@napi-rs/canvas": false};
    if (!isServer) config.resolve.fallback = {...config.resolve.fallback, fs: false, path: false};
    return config;
  }
};
module.exports = nextConfig;