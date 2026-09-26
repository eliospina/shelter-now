import "./globals.css";

export const metadata = {
  title: "Shelter Now",
  description: "Emergency shelter finder for Sweden — nearest skyddsrum, route and instructions in your language.",
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
