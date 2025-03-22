"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useVotingContract } from "@/hooks/useVotingContract";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

interface Proposal {
  description: string;
  voteCount: number;
  voters: string[];
}

export default function ResultsPage() {
  const { address, isConnected } = useAccount();
  const [isRegistered, setIsRegistered] = useState(false);
  const contract = useVotingContract();
  const [winningProposal, setWinningProposal] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<number | null>(null);

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

  const fetchWorkflowStatus = async () => {
    if (!contract) return;

    try {
      const resolvedContract = await contract;
      if (!resolvedContract) {
        setError("Contract is not initialized.");
        return;
      }
      const status = await resolvedContract.currentWorkflowStatus();
      setWorkflowStatus(status);
    } catch (err) {
      console.error("Failed to fetch workflow status:", err);
      setError("Failed to fetch workflow status.");
    }
  };

  const fetchWinningProposal = async () => {
    if (!contract) return;

    try {
      const resolvedContract = await contract;
      if (!resolvedContract) {
        setError("Contract is not initialized.");
        return;
      }
      const winningProposalDescription =
        await resolvedContract.getWinningProposal();
      setWinningProposal(winningProposalDescription);
    } catch (err) {
      console.error("Failed to fetch winning proposal:", err);
      setError("Failed to fetch winning proposal.");
    }
  };

  const fetchProposals = async () => {
    if (!contract) {
      console.error("Contract is not initialized.");
      setError("Contract is not initialized.");
      return;
    }

    try {
      const resolvedContract = await contract;
      if (!resolvedContract) {
        console.error("Resolved contract is null.");
        setError("Resolved contract is null.");
        return;
      }

      const [descriptions, voteCounts, votersPerProposal] =
        await resolvedContract.getAllProposalsWithVotes();

      const fetchedProposals = descriptions.map(
        (description: string, index: number) => ({
          description,
          voteCount: Number(voteCounts[index]),
          voters: votersPerProposal[index],
        })
      );

      setProposals(fetchedProposals);
      console.log("Fetched proposals with voters:", fetchedProposals);
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
      setError("Failed to fetch proposals.");
    }
  };

  const initializeResults = async () => {
    setError(null);
    await fetchWorkflowStatus();

    if (workflowStatus == 5) {
      await fetchWinningProposal();
      await fetchProposals();
      checkRegistration();
    } else {
      setError("Results are not available yet. Votes must be tallied.");
    }
  };

  useEffect(() => {
    initializeResults();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-800 text-white">
      <Navbar />
      <div className="flex-grow flex flex-col items-center pt-24">
        <h1 className="text-3xl font-bold mb-8 text-white">Voting Results</h1>
        <Button
          onClick={initializeResults}
          className="text-gray-800 border-b rounded-none border-b-gray-500 bg-gray-800 hover:bg-gray-800"
        ></Button>

        <div className="container text-center">
          {error ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : workflowStatus == 5 ? (
            <div>
              <div className="pb-10">
                <h2 className="text-xl font-bold mb-4">Winning Proposal</h2>
                {winningProposal ? (
                  <div className="flex items-center justify-center mb-8">
                    <CheckCircle className="text-green-500 h-6 w-6 mr-2" />
                    <p className="text-lg">{winningProposal}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Fetching winning proposal...</p>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">All Proposals</h2>
                {proposals.length > 0 ? (
                  <ul>
                    {proposals.map((proposal, index) => (
                      <li
                        key={index}
                        className="mb-4 p-4 border rounded-lg bg-gray-700"
                      >
                        <p className="text-lg font-semibold">
                          {index + 1}. {proposal.description}
                        </p>
                        <p className="text-sm text-gray-400">
                          Votes: {proposal.voteCount}
                        </p>
                        {isRegistered && (
                          <div className="mt-2">
                            <h3 className="text-md font-semibold">Voters:</h3>
                            {proposal.voters.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {proposal.voters.map((voter, voterIndex) => (
                                  <li
                                    key={voterIndex}
                                    className="text-sm text-gray-300"
                                  >
                                    {voter}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No voters for this proposal.
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No proposals available.</p>
                )}
              </div>
            </div>
          ) : (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Results Not Available</AlertTitle>
              <AlertDescription>
                The voting process is still in progress. Results will be
                available once the votes have been tallied.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
