/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    devIndicators: false,
  },
  typescript: {
    ignoreBuildErrors: true,
    devIndicators:false,
  },
};

export default nextConfig;