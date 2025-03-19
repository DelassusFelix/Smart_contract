"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import Image from "next/image";

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  if (isConnected) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center bg-gray-800 h-screen">
      <h1 className="flex items-center gap-2 text-6xl text-white font-bold mb-4">Bienvenue sur <Image src="/images/votereum_blue_allonge.png" alt="Votereum Logo" width={400} height={100} /></h1>
      <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={openConnectModal}
              className="w-80 h-16 bg-[#2A63F0] text-white text-xl font-semibold rounded-full hover:bg-blue-700 transition"
            >
              Connectez votre Wallet
            </button>
          )}
        </ConnectButton.Custom>
    </div>
  );
}
