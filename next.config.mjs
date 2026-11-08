/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
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
