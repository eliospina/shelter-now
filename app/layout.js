import "./globals.css";

export const metadata = {
  title: "Bunker Now Sverige",
  description: "Emergency shelter finder for Sweden only: nearest skyddsrum, route and instructions in your language.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
