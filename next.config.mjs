/** @type {import('next').NextConfig} */
const basePath = "/myresume";

const nextConfig = {
  output: "export",
  distDir: "dist",
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
