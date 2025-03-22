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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAccount } from "wagmi";
import Navbar from "@/components/navbar";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const contract = useVotingContract();

  const [newVoterAddress, setNewVoterAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState<number | null>(null);
  const [proposals, setProposals] = useState<
    { description: string; voteCount: number }[]
  >([]);

  const fetchWorkflowStatus = async () => {
    try {
      const resolvedContract = await contract;
      const status = await resolvedContract?.currentWorkflowStatus();
      setWorkflowStatus(status);

      if (status === 5) {
        // Assuming status 5 means results are available
        const fetchedProposals = await resolvedContract?.getProposals();
        setProposals(fetchedProposals || []);
      }
    } catch (err) {
      console.error("Failed to fetch workflow status:", err);
      setError("Failed to fetch workflow status.");
    }
  };

  // Add a voter to the whitelist
  const handleAddVoter = async () => {
    if (!newVoterAddress) {
      setError("Please enter a valid address");
      return;
    }

    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.registerVoter(newVoterAddress);
      await tx.wait();
      setSuccess("Voter added successfully");
      setNewVoterAddress("");
    } catch (err) {
      console.error("Failed to add voter:", err);
      setError("Failed to add voter. Make sure you are the owner.");
    }
  };

  // Workflow management functions
  const handleStartProposalRegistration = async () => {
    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.startProposalsRegistration();
      await tx.wait();
      setSuccess("Proposal registration started successfully");
      fetchWorkflowStatus();
    } catch (err) {
      console.error("Failed to start proposal registration:", err);
      setError("Failed to start proposal registration.");
    }
  };

  const handleEndProposalRegistration = async () => {
    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.endProposalsRegistration();
      await tx.wait();
      setSuccess("Proposal registration ended successfully");
      fetchWorkflowStatus();
    } catch (err) {
      console.error("Failed to end proposal registration:", err);
      setError("Failed to end proposal registration.");
    }
  };

  const handleStartVotingSession = async () => {
    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.startVotingSession();
      await tx.wait();
      setSuccess("Voting session started successfully");
      fetchWorkflowStatus();
    } catch (err) {
      console.error("Failed to start voting session:", err);
      setError("Failed to start voting session.");
    }
  };

  const handleEndVotingSession = async () => {
    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.endVotingSession();
      await tx.wait();
      setSuccess("Voting session ended successfully");
      fetchWorkflowStatus();
    } catch (err) {
      console.error("Failed to end voting session:", err);
      setError("Failed to end voting session.");
    }
  };

  const fetchResults = async () => {
    if (!contract) return;

    try {
      const resolvedContract = await contract;
      if (resolvedContract) {
        // Vérifiez que le workflow est à l'état "VotesTallied"
        if (workflowStatus != 5) {
          setError("Results are not available yet.");
          return;
        }

        // Récupérez la proposition gagnante
        const winningProposal = await resolvedContract.getWinningProposal();
        setSuccess(`${winningProposal}`);

        // Récupérez toutes les propositions
        const fetchedProposals = [];
        const proposalCount = await resolvedContract.proposals.length; // Nombre de propositions
        for (let i = 0; i < proposalCount; i++) {
          const proposal = await resolvedContract.proposals(i);
          fetchedProposals.push({
            description: proposal.description,
            voteCount: Number(proposal.voteCount),
          });
        }
        setProposals(fetchedProposals);
      }
    } catch (err) {
      console.error("Failed to fetch results:", err);
      setError("Failed to fetch results.");
    }
  };

  const handleTallyVotes = async () => {
    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.tallyVotes();
      await tx.wait();
      setSuccess("Votes tallied successfully");
      fetchWorkflowStatus();
    } catch (err) {
      console.error("Failed to tally votes:", err);
      setError("Failed to tally votes.");
    }
  };

  const handleResetSession = async () => {
    try {
      const resolvedContract = await contract;
      const tx = await resolvedContract?.resetSession();
      await tx.wait();
      setSuccess("Session reset successfully");
      fetchWorkflowStatus();
    } catch (err) {
      console.error("Failed to reset session:", err);
      setError("Failed to reset session.");
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchWorkflowStatus();
    }
  }, [contract, isConnected]);

  useEffect(() => {
    if (workflowStatus == 5) {
      fetchResults();
    }
  }, [workflowStatus]);

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

            {/* Workflow Management */}
            <TabsContent value="workflow" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleStartProposalRegistration}
                  className="h-20"
                  disabled={workflowStatus !== null && workflowStatus > 0} // Actif uniquement si le statut est "RegisteringVoters"
                >
                  Start Proposal Registration
                </Button>
                <Button
                  onClick={handleEndProposalRegistration}
                  className="h-20"
                  disabled={workflowStatus != 1} // Actif uniquement si le statut est "ProposalsRegistrationStarted"
                >
                  End Proposal Registration
                </Button>
                <Button
                  onClick={handleStartVotingSession}
                  className="h-20"
                  disabled={workflowStatus != 2} // Actif uniquement si le statut est "ProposalsRegistrationEnded"
                >
                  Start Voting Session
                </Button>
                <Button
                  onClick={handleEndVotingSession}
                  className="h-20"
                  disabled={workflowStatus != 3} // Actif uniquement si le statut est "VotingSessionStarted"
                >
                  End Voting Session
                </Button>
                <Button
                  onClick={handleTallyVotes}
                  className="h-20"
                  disabled={workflowStatus != 4} // Actif uniquement si le statut est "VotingSessionEnded"
                >
                  Tally Votes
                </Button>
                <Button
                  onClick={handleResetSession}
                  variant="destructive"
                  className="h-20"
                >
                  Reset Session
                </Button>
              </div>
              <div className="mt-4">
                <p>Current Workflow Status: {workflowStatus}</p>
              </div>
            </TabsContent>

            {/* Voter Management */}
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
                        <Button onClick={handleAddVoter}>Add</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    View the results of the voting session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workflowStatus == 5 ? (
                    <div>
                      <div className="flex gap-2 items-center mb-4">
                        <h2 className="text-lg font-semibold mb-2">
                          Winning Proposal :
                        </h2>
                        {success && (
                          <p className="text-lg text-green-500 font-semibold mb-2">{success}</p>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold mb-4">All Proposals</h2>
                      <ul>
                        {proposals.map((proposal, index) => (
                          <li
                            key={index}
                            className="mb-4 p-4 border rounded-lg bg-gray-800"
                          >
                            <p className="text-lg font-semibold">
                              {index + 1}. {proposal.description}
                            </p>
                            <p className="text-sm text-gray-400">
                              Votes: {proposal.voteCount}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Results are not available yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
