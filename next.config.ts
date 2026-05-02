import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import fs from "fs";
import path from "path";

// FORCE DELETE VERCEL GHOST DIRECTORY BEFORE NEXT.JS COMPILES
try {
  const ghostDir = path.join(process.cwd(), 'src', 'app', '(protected)', 'cuaderno', 'planes');
  if (fs.existsSync(ghostDir)) {
    fs.rmSync(ghostDir, { recursive: true, force: true });
    console.log('DELETED GHOST DIR:', ghostDir);
  }
} catch (e) {
  // Ignore
}

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  serverExternalPackages: ['nodemailer'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default withSerwist(nextConfig);

