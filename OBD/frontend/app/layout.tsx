import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OBDPro Scanner | Professional Car Diagnostics In Your Pocket",
  description:
    "Scan, diagnose and customize your vehicle using the most powerful OBD scanner. Compatible with 500+ car models. Full vehicle diagnostics, live sensor data, fault code scanning.",
  keywords:
    "OBD scanner, car diagnostics, OBD2, vehicle scanner, fault codes, car coding, live sensor data",
  openGraph: {
    title: "OBDPro Scanner | Professional Car Diagnostics",
    description:
      "The most powerful OBD scanner for full vehicle diagnostics, live sensor data, and one-click car coding.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
