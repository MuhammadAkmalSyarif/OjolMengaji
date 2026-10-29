import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Ojol Mengaji - Platform Pembinaan Al-Qur'an Pengemudi Ojek Online",
  description: "Aplikasi manajemen program pembinaan membaca Al-Qur'an, presensi berbasis shelter, dan evaluasi capaian driver ojek online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

