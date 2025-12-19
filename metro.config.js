const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add worklets to the extraNodeModules for proper resolution
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    if (!url.match(/^https?:\/\//)) {
      return url;
    }
    return url;
  },
};

// Ensure proper handling of native modules
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: true,
};

module.exports = config;
