/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  webpack: (config, { dev }) => {
    if (dev) {
      // Menghindari issue file-locking pack rename Webpack pada OS Windows
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;


