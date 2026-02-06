import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - allowedDevOrigins is supported in runtime but might be missing in types
  allowedDevOrigins: ["localhost:3000", "10.151.127.76:3000", "10.151.127.236:3000", ".trycloudflare.com", "reasonable-qualified-plugins-warehouse.trycloudflare.com"]
};

export default nextConfig;
