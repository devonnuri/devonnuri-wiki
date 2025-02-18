const WatchExternalFilesPlugin = require('webpack-watch-files-plugin').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/*': [`./mdx/**/*`],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.plugins.push(
        new WatchExternalFilesPlugin({
          files: ['./mdx/**/*'],
        }),
      );
    }
    return config;
  },
};

module.exports = nextConfig;
