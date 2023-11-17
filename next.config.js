/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    domains: [
      "img.clerk.com",
      "images.clerk.dev",
      "uploadthing.com",
      "placehold.co",
      "utfs.io",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      }, 
    ],
  },
};

module.exports = nextConfig;