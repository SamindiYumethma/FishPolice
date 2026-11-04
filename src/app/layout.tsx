import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import { Stage } from "../components/Stage";
import { PlayerProvider } from "../state/PlayerProvider";
import "./globals.css";

const lilita = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-lilita", display: "swap" });
const nunito = Nunito({ weight: ["700", "800", "900"], subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: "Fish Police: The Treasure Heist",
  description: "An underwater detective game: arrest the fish criminals and recover the stolen treasure.",
  icons: {
    icon: [{ url: "/icons/favicon.png", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b4fb3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lilita.variable} ${nunito.variable}`}>
      <body>
        <Stage>
          <PlayerProvider>{children}</PlayerProvider>
        </Stage>
      </body>
    </html>
  );
}
