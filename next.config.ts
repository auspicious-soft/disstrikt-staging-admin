/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow ESLint to run during builds, respecting the .eslintrc or eslint.config.mjs rules
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [ 
      {
        protocol: 'https',
        hostname: 'disstrikt.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;
