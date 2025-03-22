"use client";

import { use, useEffect, useState } from "react";
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
  const { address, isConnected } = useAccount(); // Get the connected address
  const contract = useVotingContract(); // Hook to access the contract

  const [proposal, setProposal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [proposals, setProposals] = useState<string[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<number | null>(null);
  const [votedProposalId, setVotedProposalId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false); // État pour savoir si l'utilisateur est l'owner

  const checkIfOwner = async () => {
    if (!contract || !address) return;
  
    try {
      const resolvedContract = await contract;
      if (resolvedContract) {
        const owner = await resolvedContract.owner(); // Récupère l'adresse de l'owner
        setIsOwner(owner.toLowerCase() === address.toLowerCase()); // Compare l'adresse connectée avec celle de l'owner
      }
    } catch (err) {
      console.error("Failed to check if user is owner:", err);
      setError("Failed to check if user is owner.");
    }
  };

  // Check if the user is connected or not

  useEffect(() => {
    if (!isConnected) {
      setError("Sorry, you need to be connected to use this feature.");
    } else {
      setError(""); // Clear error if connected
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <>
        <Navbar />
        <div className="w-screen flex justify-center text-white pt-5 bg-gray-800">
          <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Voter Interface</h1>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </>
    );
  }

  // Check voter registration
  const checkRegistration = async () => {
    if (!contract || !address) return;

    try {
      const resolvedContract = await contract;
      if (resolvedContract) {
        const voter = await resolvedContract.voterAddress(address);
        setIsRegistered(voter.isRegistered);
      }
    } catch (err) {
      console.error("Failed to check voter registration:", err);
    }
  };

  // Fetch proposals
  const fetchProposals = async () => {
    if (!contract) return;

    try {
      const resolvedContract = await contract;
      if (resolvedContract) {
        const fetchedProposals = [];
        let index = 0;
        while (true) {
          try {
            const proposal = await resolvedContract.proposals(index);
            fetchedProposals.push(proposal.description);
            index++;
          } catch {
            break; // Stop fetching when an error occurs
          }
        }
        setProposals(fetchedProposals);
      }
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    }
  };

  // Fetch workflow status
  const fetchWorkflowStatus = async () => {
    if (!contract) return;

    try {
      const resolvedContract = await contract;
      if (resolvedContract) {
        const status = await resolvedContract.currentWorkflowStatus();
        setWorkflowStatus(status);
      }
    } catch (err) {
      console.error("Failed to fetch workflow status:", err);
    }
  };

  // Submit a proposal
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
      const resolvedContract = await contract;
      if (resolvedContract) {
        const tx = await resolvedContract.addProposal(proposal);
        await tx.wait();
        setProposal("");
        setSuccess("Proposal submitted successfully");
        fetchProposals();
      }
    } catch (err) {
      console.error("Failed to submit proposal:", err);
      setError("Failed to submit proposal");
    }
  };

  // Cast a vote
  const handleVote = async (proposalId: number) => {
    if (workflowStatus != 3) {
      setError("Voting session is not active");
      return;
    }

    try {
      const resolvedContract = await contract;
      if (!resolvedContract) {
        setError("Contract is not available");
        return;
      }
      const tx = await resolvedContract.vote(proposalId);
      await tx.wait();
      setVotedProposalId(proposalId); // Mettez à jour l'état avec l'ID de la proposition votée
      setSuccess(`Vote cast successfully for proposal ${proposalId + 1}`);
    } catch (err) {
      console.error("Failed to cast vote:", err);
      setError("Failed to cast vote");
    }
  };

  const fetchVotedProposal = async () => {
    if (!contract || !address) return;

    try {
      const resolvedContract = await contract;
      if (resolvedContract) {
        // Récupérez les informations du votant
        const voter = await resolvedContract.voterAddress(address);

        if (voter.hasVoted) {
          // Convertir l'ID de la proposition votée en un nombre classique
          const votedProposalId = Number(voter.votedProposalId);
          const votedProposal = await resolvedContract.proposals(
            votedProposalId
          );
          setVotedProposalId(votedProposalId); // Mettez à jour l'état avec l'ID
          setSuccess(`You voted for: ${votedProposal.description}`);
        } else {
          setVotedProposalId(null); // Aucun vote
          setSuccess("You have not voted yet.");
        }
      }
    } catch (err) {
      console.error("Failed to fetch voted proposal:", err);
      setError("Failed to fetch voted proposal");
    }
  };

  const handleCancelVote = async () => {
    if (workflowStatus != 3) {
      setError("Voting session is not active");
      return;
    }

    try {
      const resolvedContract = await contract;
      if (!resolvedContract) {
        setError("Contract is not available");
        return;
      }
      const tx = await resolvedContract.cancelVote();
      await tx.wait();
      setVotedProposalId(null); // Réinitialisez l'état après l'annulation
      setSuccess("Vote successfully cancelled");
    } catch (err) {
      console.error("Failed to cancel vote:", err);
      setError("Failed to cancel vote");
    }
  };

  // Manual initialization
  const initialize = async () => {
    if (isConnected) {
      checkIfOwner();
      await checkRegistration();
      await fetchProposals();
      await fetchWorkflowStatus();
      await fetchVotedProposal();
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-screen flex justify-center text-white">
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-8">Voter Interface</h1>
          <Button onClick={initialize} className="mb-4">
            Recharger
          </Button>
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
                      Your address is not registered as a voter
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          {isRegistered && workflowStatus == 1 && (
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
                  <li key={index} className="mb-2 p-2 flex items-center">
                    <div>
                      <p className="text-md font-semibold">
                        {index + 1}. {proposal}
                      </p>
                    </div>
                    {votedProposalId === index ? (
                      <>
                        {/* Icône "check" pour la proposition votée */}
                        <CheckCircle className="text-green-500 h-6 w-6 ml-2" />
                        {/* Bouton "Cancel Vote" */}
                        {workflowStatus == 3 && (
                          <Button
                            onClick={handleCancelVote}
                            className="ml-4 bg-red-500 hover:bg-red-600 text-white"
                          >
                            Cancel Vote
                          </Button>
                        )}
                      </>
                    ) : (
                      workflowStatus == 3 && (
                        // Bouton "Vote" pour les propositions non votées
                        <Button
                          onClick={() => handleVote(index)}
                          className="ml-4 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Vote
                        </Button>
                      )
                    )}
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
