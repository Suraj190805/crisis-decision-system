import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Global Crisis Decision System — AI-Powered Crisis Intelligence",
  description:
    "Multi-agent AI system for real-time global crisis analysis, scenario simulation, supply chain disruption tracking, and geopolitical risk assessment.",
  keywords: "crisis analysis, AI, geopolitical risk, supply chain, global economy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
