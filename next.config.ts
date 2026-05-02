import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import fs from "fs";
import path from "path";

// FORCE DELETE VERCEL GHOST DIRECTORIES BEFORE NEXT.JS COMPILES
const ghostDirs = [
  path.join(process.cwd(), 'src', 'app', '(protected)', 'cuaderno', 'planes'),
  path.join(process.cwd(), 'src', 'app', 'cuaderno', 'planes'),
];
for (const ghostDir of ghostDirs) {
  try {
    if (fs.existsSync(ghostDir)) {
      fs.rmSync(ghostDir, { recursive: true, force: true });
      console.log('[CLEANUP] DELETED GHOST DIR:', ghostDir);
    }
  } catch (e) {
    console.log('[CLEANUP] Failed to delete:', ghostDir, e);
  }
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

