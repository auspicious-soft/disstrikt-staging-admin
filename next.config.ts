/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_APP_GOOGLE_MAPS_API_KEY ||
      "",
    NEXT_AWS_S3_BASE_URL: process.env.NEXT_PUBLIC_AWS_BUCKET_PATH,
  },
  eslint: {
    // Allow ESLint to run during builds, respecting the .eslintrc or eslint.config.mjs rules
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "disstrikt.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "disstrikt-staging.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
