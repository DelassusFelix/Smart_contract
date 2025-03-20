"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useVotingContract } from "@/hooks/useVotingContract";
import Navbar from "@/components/navbar";

export default function VoterPage() {
  const { address, isConnected } = useAccount(); // Récupérer l'adresse connectée
  const contract = useVotingContract(); // Hook pour accéder au contrat

  const [proposal, setProposal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [proposals, setProposals] = useState<string[]>([]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!contract || !address) return;

      try {
        const resolvedContract = await contract; // Resolve the contract promise
        if (resolvedContract) {
          const voter = await resolvedContract.voterAddress(address); // Correct method name
          setIsRegistered(voter.isRegistered);
        }
      } catch (err) {
        console.error("Failed to check voter registration:", err);
      }
    };

    if (isConnected) {
      checkRegistration();
    }
  }, [contract, address, isConnected]);

  const handleSubmitProposal = async () => {
    if (!isRegistered) {
      setError("You must be a registered voter");
      return;
    }

    if (!proposal) {
      setError("Please enter a proposal");
      return;
    }

    try {
      const resolvedContract = await contract; // Resolve the contract promise
      if (resolvedContract) {
        const tx = await resolvedContract.addProposal(proposal); // Appel de la fonction du contrat
        await tx.wait(); // Attendre la confirmation de la transaction
        setProposal("");
        setSuccess("Proposal submitted successfully");
      }
    } catch (err) {
      console.error("Failed to submit proposal:", err);
      setError("Failed to submit proposal");
    }
  };

  const fetchProposals = async () => {
    if (!contract) return;

    try {
      const resolvedContract = await contract; // Resolve the contract promise
      if (resolvedContract) {
        const proposalsCount = await resolvedContract.getProposalsCount(); // Fetch the number of proposals
        const fetchedProposals = [];
        for (let i = 0; i < proposalsCount; i++) {
          const proposal = await resolvedContract.getProposal(i); // Fetch each proposal
          fetchedProposals.push(proposal.description);
        }
        setProposals(fetchedProposals);
      }
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchProposals();
    }
  }, [contract, isConnected]);

  return (
    <>
      <Navbar />
      <div className="w-screen flex justify-center text-white">
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-8">Voter Interface</h1>
          {address && <p className="mb-4">Connected as: {address}</p>}

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

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Voter Registration</CardTitle>
              <CardDescription>
                Verify your voter registration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                {isRegistered ? (
                  <Alert className="border-green-500 text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Registered</AlertTitle>
                    <AlertDescription>
                      You are registered as a voter
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-500 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Registered</AlertTitle>
                    <AlertDescription>
                      Your address is not registered as a voter {String(isRegistered)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {isRegistered && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Submit a Proposal</CardTitle>
                <CardDescription>
                  Enter your proposal for the voting session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="proposal">Proposal</Label>
                    <Input
                      id="proposal"
                      placeholder="Enter your proposal"
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSubmitProposal}>
                    Submit Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Proposals</CardTitle>
              <CardDescription>List of all proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                {proposals.map((proposal, index) => (
                  <li key={index} className="mb-2">
                    {index + 1}. {proposal}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
