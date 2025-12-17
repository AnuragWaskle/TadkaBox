const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
    /\/node_modules\/.*\/test\/.*/,
    /\/node_modules\/.*\/__tests__\/.*/,
    /\/android\/.*/,
    /\/ios\/.*/
];

module.exports = config;
