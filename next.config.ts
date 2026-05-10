import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Allow Vercel Blob images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              // Allow images from self, data URIs, https, and Vercel Blob
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              // Allow connections to Groq AI and Vercel Blob storage
              "connect-src 'self' https://api.groq.com https://*.public.blob.vercel-storage.com",
              // Allow iframes for Google Docs viewer (used by FileViewer for DOCX)
              "frame-src 'self' https://docs.google.com",
              // Allow Vercel Blob media (PDFs, videos, audio)
              "media-src 'self' https://*.public.blob.vercel-storage.com",
              "object-src 'self' https://*.public.blob.vercel-storage.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  async redirects() {
    return [];
  },
};

export default withPWA(nextConfig);
