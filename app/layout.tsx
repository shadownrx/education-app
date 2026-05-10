import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "EduFlow | Gestión Educativa Inteligente",
  description: "La plataforma integral para profesores y alumnos potenciada por IA. Planifica clases, controla la asistencia y gestiona entregas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduFlow",
  },
  icons: {
    apple: "/icons/icon.svg",
  },
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#f4f7fb] text-slate-900">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
