/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for the Cloud Run Dockerfile.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
