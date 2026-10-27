/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "leaflet",
      "three",
      "gsap",
      "@radix-ui/react-select",
      "@radix-ui/react-dropdown-menu",
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
