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
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [newVoterAddress, setNewVoterAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState<number | null>(null);
  const [proposals, setProposals] = useState<
    { description: string; voteCount: number }[]
  >([]);
  const contract = useVotingContract();
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();

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

  const fetchWorkflowStatus = async () => {
    try {
      const resolvedContract = await contract;
      const status = await resolvedContract?.currentWorkflowStatus();
      setWorkflowStatus(status);

      if (status === 5) {
        fetchResults();
      }
    } catch (err) {
      console.error("Failed to fetch workflow status:", err);
      setError("Failed to fetch workflow status.");
    }
  };

  const fetchResults = async () => {
    if (!contract) return;

    try {
      const resolvedContract = await contract;
      if (resolvedContract) {
        if (workflowStatus != 5) {
          setError("Results are not available yet.");
          return;
        }

        const winningProposal = await resolvedContract.getWinningProposal();
        setSuccess(`${winningProposal}`);

        const fetchedProposals = [];
        const proposalCount = await resolvedContract.proposals.length;
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
      checkIfOwner();
      fetchWorkflowStatus();
    }
  }, [isConnected, address, contract]);

  useEffect(() => {
    if (workflowStatus == 5) {
      fetchResults();
    }
  }, [workflowStatus]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isOwner) {
    return (
      <div className="w-screen flex justify-center items-center text-white pt-5 bg-gray-800 min-h-screen">
        <div className="container py-10 text-center">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <div className="bg-red-500 text-white p-4 rounded-lg">
            <AlertCircle className="inline-block h-6 w-6 mr-2" />
            <span>You are not the administrator. Please connect with the admin account.</span>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

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
                  disabled={workflowStatus !== null && workflowStatus > 0}
                >
                  Start Proposal Registration
                </Button>
                <Button
                  onClick={handleEndProposalRegistration}
                  className="h-20"
                  disabled={workflowStatus != 1}
                >
                  End Proposal Registration
                </Button>
                <Button
                  onClick={handleStartVotingSession}
                  className="h-20"
                  disabled={workflowStatus != 2}
                >
                  Start Voting Session
                </Button>
                <Button
                  onClick={handleEndVotingSession}
                  className="h-20"
                  disabled={workflowStatus != 3}
                >
                  End Voting Session
                </Button>
                <Button
                  onClick={handleTallyVotes}
                  className="h-20"
                  disabled={workflowStatus != 4}
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

            {/* Results */}
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
                          <p className="text-lg text-green-500 font-semibold mb-2">
                            {success}
                          </p>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold mb-4">
                        All Proposals
                      </h2>
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