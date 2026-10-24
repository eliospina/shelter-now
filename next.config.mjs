/** @type {import('next').NextConfig} */
const nextConfig =
  process.env.BUILD_TARGET === "app"
    ? // Static files for the Android app (see scripts/build-app.mjs).
      { output: "export" }
    : {};

export default nextConfig;
