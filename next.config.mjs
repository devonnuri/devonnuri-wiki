/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/*': [`./mdx/**/*`],
    },
  },
};

export default nextConfig;
