/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: []
  },
  typedRoutes: false
};

export default nextConfig;
