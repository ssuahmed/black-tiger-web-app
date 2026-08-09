/** @type {import('next').NextConfig} */
function mediaRemotePatterns() {
  const patterns = [];
  const candidates = [
    process.env.NEXT_PUBLIC_ODOO_IMAGE_URL,
    process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/v1\/?$/, ""),
    "http://localhost:3001",
    "http://localhost:8069",
  ].filter(Boolean);

  for (const raw of candidates) {
    try {
      const url = new URL(raw.includes("://") ? raw : `http://${raw}`);
      const base = {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
      };
      patterns.push(
        { ...base, pathname: "/web/image/**" },
        { ...base, pathname: "/v1/media/**" },
      );
    } catch {
      /* skip invalid */
    }
  }
  return patterns;
}

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      ...mediaRemotePatterns(),
    ],
  },
  async redirects() {
    return [{ source: "/homev2", destination: "/", permanent: true }];
  },
};

export default nextConfig;
