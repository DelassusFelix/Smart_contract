"use client";

import { useState, useEffect } from "react";
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
import { VotingPhase, useVotingStore } from "@/lib/voting-store"; // Removed resetSession import
import { VotersList } from "@/components/voters-list";
import { ProposalsList } from "@/components/proposals-list";
import { ResultsView } from "@/components/results-view";

export default function AdminPage() {
  const {
    votingPhase,
    voters,
    proposals,
    votes,
    startProposalRegistration,
    endProposalRegistration,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    addVoter,
    removeVoter,
    resetSession, // Access resetSession from useVotingStore
  } = useVotingStore();

  const [newVoterAddress, setNewVoterAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddVoter = () => {
    if (!newVoterAddress) {
      setError("Please enter a valid address");
      return;
    }

    if (voters.some((voter) => voter.address === newVoterAddress)) {
      setError("This address is already whitelisted");
      return;
    }

    addVoter(newVoterAddress);
    setNewVoterAddress("");
    setSuccess("Voter added successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  const getPhaseLabel = () => {
    switch (votingPhase) {
      case VotingPhase.RegisteringVoters:
        return "Registering Voters";
      case VotingPhase.ProposalsRegistrationStarted:
        return "Proposals Registration";
      case VotingPhase.ProposalsRegistrationEnded:
        return "Proposals Registration Ended";
      case VotingPhase.VotingSessionStarted:
        return "Voting Session";
      case VotingPhase.VotingSessionEnded:
        return "Voting Session Ended";
      case VotingPhase.VotesTallied:
        return "Votes Tallied";
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="w-screen flex justify-center text-white pt-5">
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Phase</CardTitle>
              <CardDescription>
                The current stage of the voting process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="text-lg py-2 px-4">{getPhaseLabel()}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voters</CardTitle>
              <CardDescription>Total registered voters</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              <span className="text-2xl font-bold">{voters.length}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proposals</CardTitle>
              <CardDescription>Total submitted proposals</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center">
              <span className="text-2xl font-bold">{proposals.length}</span>
            </CardContent>
          </Card>
        </div>

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
                onClick={startProposalRegistration}
                disabled={votingPhase !== VotingPhase.RegisteringVoters}
                className="h-20"
              >
                Start Proposal Registration
              </Button>

              <Button
                onClick={endProposalRegistration}
                disabled={
                  votingPhase !== VotingPhase.ProposalsRegistrationStarted
                }
                className="h-20"
              >
                End Proposal Registration
              </Button>

              <Button
                onClick={startVotingSession}
                disabled={
                  votingPhase !== VotingPhase.ProposalsRegistrationEnded
                }
                className="h-20"
              >
                Start Voting Session
              </Button>

              <Button
                onClick={endVotingSession}
                disabled={votingPhase !== VotingPhase.VotingSessionStarted}
                className="h-20"
              >
                End Voting Session
              </Button>

              <Button
                onClick={tallyVotes}
                disabled={votingPhase !== VotingPhase.VotingSessionEnded}
                className="h-20 md:col-span-2"
              >
                Tally Votes
              </Button>

              <Button
                onClick={resetSession}
                disabled={votingPhase === VotingPhase.RegisteringVoters}
                className="h-20 md:col-span-2"
              >
                Reset Session
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Proposals</h3>
              <ProposalsList />
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
                        disabled={votingPhase !== VotingPhase.RegisteringVoters}
                      />
                      <Button
                        onClick={handleAddVoter}
                        disabled={votingPhase !== VotingPhase.RegisteringVoters}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <h3 className="text-xl font-bold mb-4">Registered Voters</h3>
              <VotersList
                canRemove={votingPhase === VotingPhase.RegisteringVoters}
                onRemove={removeVoter}
              />
            </div>
          </TabsContent>

          <TabsContent value="results" className="pt-4">
            <ResultsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
