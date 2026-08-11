import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],

  async rewrites() {
    return [
      // Casebook PDFs get a public URL that reads like a file and carries the
      // college name as keywords (Google indexes PDFs as their own results, and
      // /api/resources/iimb-2025 told it nothing). The route resolves both the
      // descriptive slug and the short internal one, so old links keep working.
      {
        source: '/casebooks/:slug.pdf',
        destination: '/api/resources/:slug',
      },
    ];
  },
};

export default nextConfig;
