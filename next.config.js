/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // output: "export", // Temporarily disabled
  trailingSlash: true,
  // distDir: "out", // Use default .next directory

  images: {
    domains: ["maps.googleapis.com", "lh3.googleusercontent.com"],
    unoptimized: true,
  },

  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
}

module.exports = nextConfig