/** @type {import('next').NextConfig} */
const nextConfig = {images: {
  remotePatterns: [{
    protocol: "https",
    hostname: "wjucegfkshgallheqlzz.supabase.co",
    port: ''
  }]
}}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
