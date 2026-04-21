/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'images.mertcin.com'], //cloudinary ne olacak?
  },
}

export default nextConfig;