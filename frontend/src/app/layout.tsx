import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: "OpsPulse // SYSTEM",
  description: "Automated incident detection, triage, and escalation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-[#030014] text-slate-200 antialiased selection:bg-purple-500/30 selection:text-purple-200 min-h-screen relative`}>
        {/* Animated Background Gradients */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-glow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-600/10 blur-[100px] animate-float"></div>
        </div>

        {children}
        <Toaster position="bottom-right" theme="dark" richColors closeButton toastOptions={{
          className: 'glass-panel border-white/10 text-white'
        }} />
      </body>
    </html>
  );
}