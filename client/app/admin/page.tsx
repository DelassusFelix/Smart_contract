"use client";

import { useState, useEffect } from "react";
import { useVotingContract } from "@/hooks/useVotingContract";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, UserPlus, Users } from "lucide-react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const contract = useVotingContract(); // Hook pour accéder au contrat

  const [newVoterAddress, setNewVoterAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddVoter = async () => {
    if (!newVoterAddress) {
      setError("Please enter a valid address");
      return;
    }

    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.registerVoter(newVoterAddress); // Appel de la fonction du contrat
      await tx.wait(); // Attendre la confirmation de la transaction
      setSuccess("Voter added successfully");
    } catch (err) {
      setError("Failed to add voter. Make sure you are the owner.");
    }
  };

  const handleStartProposalRegistration = async () => {
    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.startProposalsRegistration(); // Appel de la fonction du contrat
      await tx.wait();
      setSuccess("Proposal registration started successfully");
    } catch (err) {
      setError("Failed to start proposal registration.");
    }
  };

  const handleTallyVotes = async () => {
    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.tallyVotes(); // Appel de la fonction du contrat
      await tx.wait();
      setSuccess("Votes tallied successfully");
    } catch (err) {
      setError("Failed to tally votes.");
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <>
      <Navbar />
      <div className="w-screen flex justify-center text-white pt-5 bg-gray-800">
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-500 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="workflow" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflow">Workflow Management</TabsTrigger>
              <TabsTrigger value="voters">Voter Management</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleStartProposalRegistration}
                  className="h-20"
                >
                  Start Proposal Registration
                </Button>

                <Button onClick={handleTallyVotes} className="h-20">
                  Tally Votes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="voters" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Voter</CardTitle>
                  <CardDescription>
                    Add a new voter to the whitelist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="address">Voter Address</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="address"
                          placeholder="Enter voter address"
                          value={newVoterAddress}
                          onChange={(e) => setNewVoterAddress(e.target.value)}
                        />
                        <Button onClick={handleAddVoter}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
