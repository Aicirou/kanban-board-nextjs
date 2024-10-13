/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  pageOptions: {
    "@lib/auth.ts": {
      static: false,
    },
  },
}
const dynamic = "force-dynamic"

module.exports = {
  nextConfig,
  dynamic,
}
