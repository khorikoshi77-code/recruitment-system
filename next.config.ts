import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/session',
        destination: '/api/auth/session'
      }
    ]
  }
};

export default nextConfig;
