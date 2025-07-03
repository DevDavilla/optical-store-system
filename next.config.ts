import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isDev, webpack }) => {
    config.resolve.alias["@"] = require("path").join(__dirname, "src");
    return config;
  },
  /* config options here */
};

export default nextConfig;
