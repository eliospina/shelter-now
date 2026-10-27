import "./globals.css";

export const metadata = {
  title: "Bunker Now Sverige",
  description: "Emergency shelter finder for Sweden only: nearest skyddsrum, route and instructions in your language.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Same as --bg in globals.css, so the status bar blends with the page.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1526" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
