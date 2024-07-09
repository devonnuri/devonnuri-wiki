import copyWebpackPlugin from 'copy-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // if (isServer) {
    //   config.plugins.push(
    //     new copyWebpackPlugin({
    //       patterns: [
    //         {
    //           from: 'mdx/',
    //           to: 'mdx/',
    //         },
    //       ],
    //     }),
    //   );
    // }
    return config;
  },
  experimental: {
    outputFileTracingIncludes: {
      '/*': [`./mdx/**/*`],
    },
  },
};

export default nextConfig;
