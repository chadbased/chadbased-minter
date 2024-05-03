import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from "./providers";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chad Based",
  description: "Chad Based NFT Collection Minting Website",
  applicationName: "Chad Based Minter",
  twitter: {
    card: "summary_large_image",
    site: "@site",
    creator: "@creator",
    images: "https://mint.chadbased.com/FLAMES.jpg",
  },
  openGraph: {
    type: "website",
    url: "https://mint.chadbased.com",
    title: "Chad Based Minter",
    description: "Chad Based NFT Collection Minting Website",
    siteName: "Chad Based",
    images: [
      {
        url: "https://mint.chadbased.com/FLAMES.jpg",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
