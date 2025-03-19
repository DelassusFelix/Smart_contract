import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Image from "next/image";
import "@/app/globals.css";
import Providers from "@/app/providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Voting smart contract",
  description: "Generated by Delassus Félix & Gillet Victor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans bg-gray-800`}>
      <body className="bg-gray-800 w-screen">
      <nav className="bg-gray-800 p-4">
                <ul className="flex justify-between items-center space-x-4 mr-4">
                  <li>
                    <a
                      href="/"
                      className="flex items-center gap-2 text-2xl text-white hover:text-gray-400"
                    >
                      <Image
                        src="/images/votereum_blue_allonge.png"
                        alt="logo"
                        width={200}
                        height={80}
                      />
                    </a>
                  </li>
                  <ul>
                    <li>
                      <a href="/logout"
                      className="flex items-center gap-2 text-xl text-white hover:text-gray-400">Logout</a>
                    </li>
                  </ul>
                </ul>
              </nav>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
