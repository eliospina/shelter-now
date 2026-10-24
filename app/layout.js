import { Geist } from "next/font/google";
import "./globals.css";

// Self-hosted at build time, so the Android app has it offline. Covers
// Swedish and Ukrainian; Arabic and Persian use the system's own fonts.
const geist = Geist({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-geist" });

export const metadata = {
  title: "Bunker Now",
  description: "Emergency shelter finder for Sweden: nearest skyddsrum, route and instructions in your language.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
