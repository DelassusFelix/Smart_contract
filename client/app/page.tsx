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
import {ShieldUser, User } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  {/*if (!isConnected) {
    router.push("/login");
  }*/}

  return (
    <div className="w-screen flex flex-col items-center justify-center min-h-screen py-12 space-y-8 text-white bg-gray-800 ">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Votereum</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          A secure and transparent platform for proposal submission and voting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
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
      </div>

      <div className="mt-8">
        <Link href="/results">
          <Button variant="link" className="text-white">View Current Results</Button>
        </Link>
      </div>
    </div>
  );
}
