/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
})

const nextConfig = {
  reactStrictMode: true,
  // output: "export", // Temporarily disabled
  trailingSlash: true,
  distDir: "out",

  images: {
    domains: ["maps.googleapis.com", "lh3.googleusercontent.com"],
    unoptimized: true,
  },

  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
}

module.exports = withPWA(nextConfig)