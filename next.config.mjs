/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/myresume',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
