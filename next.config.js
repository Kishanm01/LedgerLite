/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */
  exclude: [/toMigrate/, /nginx/],
  output: "standalone"
}

module.exports = nextConfig