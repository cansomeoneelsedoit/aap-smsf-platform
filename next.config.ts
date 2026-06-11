import type { NextConfig } from "next";

/**
 * Pages at /parties/* are aliased to /clients/* for user clarity
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth"],
  async rewrites() {
    return [
      {
        source: "/clients/create",
        destination: "/parties/create",
      },
      {
        source: "/clients/:partyId",
        destination: "/parties/:partyId",
      },
      {
        source: "/clients",
        destination: "/parties",
      },
    ];
  },
};

export default nextConfig;
