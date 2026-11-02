/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/halaman-user',
        destination: '/user',
      },
      {
        source: '/halaman%20user',
        destination: '/user',
      },
      {
        source: '/halaman-admin',
        destination: '/admin',
      },
      {
        source: '/halaman%20admin',
        destination: '/admin',
      },
      {
        source: '/halaman-guru',
        destination: '/guru',
      },
      {
        source: '/halaman%20guru',
        destination: '/guru',
      },
    ];
  },
};

export default nextConfig;
