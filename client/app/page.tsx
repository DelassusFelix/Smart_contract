"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldUser, User, Vote } from "lucide-react";
import { useVotingContract } from "@/hooks/useVotingContract";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const contract = useVotingContract();
  const [isOwner, setIsOwner] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkIfOwner = async () => {
    if (!contract || !address) return;

    try {
      const resolvedContract = await contract;
      if (resolvedContract) {
        const owner = await resolvedContract.owner();
        setOwnerAddress(owner);
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
      }
    } catch (err) {
      console.error("Failed to check if user is owner:", err);
      setError("Failed to check if user is owner.");
    }
  };

  useEffect(() => {
    checkIfOwner();
  }, [isConnected, address, contract]);

  return (
    <div className="w-screen flex flex-col items-center justify-center min-h-screen py-12 space-y-14 text-white bg-gray-800 overflow-hidden h-screen">
      <div className="text-center space-y-4 flex flex-col items-center">
        <Image src="/images/Votereum_blue_allonge.png" alt="Votereum" width={350} height={80} />
        <p className="text-xl text-gray-400">
          A secure and transparent platform for proposal submission and voting
        </p>
      </div>

      <div
        className={`grid gap-6 w-full max-w-5xl ${
          isOwner ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
        }`}
      >
        {isOwner && (
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                Manage the voting process, whitelist voters, and view results
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <ShieldUser className="w-18 h-18" />
            </CardContent>
            <CardFooter>
              <Link href="/admin" className="w-full">
                <Button className="w-full">Access Admin Panel</Button>
              </Link>
            </CardFooter>
          </Card>
        )}

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Voter Interface</CardTitle>
            <CardDescription>
              Submit proposals and vote on your preferred options
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <User className="w-18 h-18" />
          </CardContent>
          <CardFooter>
            <Link href="/voter" className="w-full">
              <Button className="w-full" variant="outline">
                Access Voter Interface
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Results interface</CardTitle>
            <CardDescription>
              View the results of the current voting session
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Vote className="w-18 h-18" />
          </CardContent>
          <CardFooter>
            <Link href="/results" className="w-full">
              <Button className="w-full" variant="outline">
              View Current Results
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
