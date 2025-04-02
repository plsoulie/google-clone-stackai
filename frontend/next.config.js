/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'upload.wikimedia.org',
      'images.squarespace-cdn.com',
      'luckylabcoffee.com',
      'www.google.com',
    ],
  },
  // Only include rewrites if not in serverless mode
  async rewrites() {
    if (process.env.NEXT_PUBLIC_USE_SERVERLESS === 'true') {
      return [];
    }
    
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },
  // Add transpilePackages if any packages need to be transpiled
  transpilePackages: ['sonner', 'next-themes', 'recharts', 'input-otp'],
};

module.exports = nextConfig; 