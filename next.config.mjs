/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable trailing slash redirects to fix webhook 307 issues
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ["sharp", "nodemailer", "pdf-parse", "canvas"],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these as external properly to avoid bundling native extensions
      config.externals.push("sharp");
      config.externals.push("canvas");
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
        nodemailer: false,
      };

      config.externals = config.externals || [];
      config.externals.push({
        nodemailer: "commonjs nodemailer",
        crypto: "crypto",
        fs: "fs",
        stream: "stream",
        util: "util",
      });
    }
    return config;
  },
};

export default nextConfig;
