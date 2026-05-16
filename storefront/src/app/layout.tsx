import type { Metadata } from "next";
import { Noto_Serif, Inter } from "next/font/google";
import "./globals.css";
import { StorefrontProvider } from "@/components/StorefrontProvider";
import { getEnvironmentalContext } from "@/lib/mock/environmental";
import { getMockUserProfile } from "@/lib/mock/historical";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ÉCLAT — Collection 004",
  description:
    "A generative editorial storefront. Quiet elegance in monochrome — recommendations that adapt to how you move through the collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const env = getEnvironmentalContext();
  const historical = getMockUserProfile();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${notoSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col eclat-surface">
        <StorefrontProvider env={env} historical={historical}>
          {children}
        </StorefrontProvider>
      </body>
    </html>
  );
}
