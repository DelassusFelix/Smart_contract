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
import { ShieldUser, User } from "lucide-react";
import { useVotingContract } from "@/hooks/useVotingContract";
import { useState, useEffect } from "react";

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
        const owner = await resolvedContract.owner(); // Récupère l'adresse de l'owner
        setOwnerAddress(owner); // Met à jour l'état avec l'adresse de l'owner
        setIsOwner(owner.toLowerCase() === address.toLowerCase()); // Compare l'adresse connectée avec celle de l'owner
      }
    } catch (err) {
      console.error("Failed to check if user is owner:", err);
      setError("Failed to check if user is owner.");
    }
  };


  useEffect(() => {
    const checkOwner = async () => {
      if (isConnected && contract) {
        const resolvedContract = await contract;
        const owner = await resolvedContract?.owner();
        setIsOwner(owner === address);
      }
    };
    checkOwner();
  }, [isConnected, address, contract]);

  return (
    <div className="w-screen flex flex-col items-center justify-center min-h-screen py-12 space-y-8 text-white bg-gray-800 overflow-hidden h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Votereum</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          A secure and transparent platform for proposal submission and voting
        </p>
      </div>

      <div className={`grid gap-6 w-full max-w-4xl ${isOwner ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
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

<Card className="flex flex-col justify-between mx-auto w-4/5 md:w-3/4 lg:w-2/3">
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
      </div>

      <div className="mt-8">
        <Link href="/results">
          <Button variant="link" className="text-white">View Current Results</Button>
        </Link>
      </div>
    </div>
  );
}