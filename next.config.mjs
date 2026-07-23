/** @type {import('next').NextConfig} */
function odooRemotePatterns() {
  const patterns = [];
  const raw =
    process.env.NEXT_PUBLIC_ODOO_IMAGE_URL ||
    process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/v1\/?$/, "") ||
    "http://localhost:8069";
  try {
    const url = new URL(raw.includes("://") ? raw : `http://${raw}`);
    patterns.push({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/web/image/**",
    });
  } catch {
    patterns.push({
      protocol: "http",
      hostname: "localhost",
      pathname: "/web/image/**",
    });
  }
  return patterns;
}

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      ...odooRemotePatterns(),
    ],
  },
};

export default nextConfig;
