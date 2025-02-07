import { Montserrat } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

const inter = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "SecureQR",
  description: "QR Codes Reinvented with Blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}<Analytics /></body>
    </html>
  );
}
