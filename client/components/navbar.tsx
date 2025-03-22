import { useAccount } from "wagmi";
import Link from "next/link";
import Image from "next/image";
import { useVotingContract } from "@/hooks/useVotingContract";
import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const  contract = useVotingContract();
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIfOwner = async () => {
    if (!contract || !address) return;

    try {
      const resolvedContract = await contract;
      if (!resolvedContract) return;
      const owner = await resolvedContract.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } catch (err) {
      console.error("Failed to check if user is owner:", err);
      setError("Failed to check if user is owner.");
    }
  };

  useEffect(() => {
    const checkOwnerStatus = async () => {
      if (isConnected && (await contract)) {
        checkIfOwner();
      }
    };
    checkOwnerStatus();
  }, [isConnected, address, contract]);

  return (
    <nav className="bg-gray-800 p-4 fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
        <Image src="/images/Votereum_blue_allonge.png" alt="Votereum" width={220} height={80} />
        </Link>
        <div className="flex-grow"></div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-white">
            Home
          </Link>
          {isOwner && (
            <Link href="/admin" className="text-white">
              Admin Panel
            </Link>
          )}
          <Link href="/voter" className="text-white">
            Voter Interface
          </Link>
          <Link href="/results" className="text-white">
            Results
          </Link>
        </div>
        <div className="ml-4">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}