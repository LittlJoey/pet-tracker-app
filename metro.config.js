/* eslint-env node */
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// https://github.com/supabase/supabase-js/issues/1400
config.resolver.unstable_enablePackageExports = false;
module.exports = config;
