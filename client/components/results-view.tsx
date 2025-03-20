"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VotingPhase, useVotingStore } from "@/lib/voting-store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Trophy } from "lucide-react"

export function ResultsView() {
  const { votingPhase, proposals, votes } = useVotingStore()

  if (votingPhase !== VotingPhase.VotesTallied) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Results Not Available</AlertTitle>
        <AlertDescription>
          The voting process is still in progress. Results will be available once the votes have been tallied.
        </AlertDescription>
      </Alert>
    )
  }

  // Count votes for each proposal
  const voteCounts = proposals.map((_, index) => {
    return votes.filter((vote) => vote.proposalId === index).length
  })

  // Find the winning proposal(s)
  const maxVotes = Math.max(...voteCounts)
  const winningProposalIds = voteCounts
    .map((count, index) => ({ count, index }))
    .filter((item) => item.count === maxVotes)
    .map((item) => item.index)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            Winning Proposal{winningProposalIds.length > 1 ? "s" : ""}
          </CardTitle>
          <CardDescription>The proposal{winningProposalIds.length > 1 ? "s" : ""} with the most votes</CardDescription>
        </CardHeader>
        <CardContent>
          {winningProposalIds.map((id) => (
            <div key={id} className="p-4 bg-muted rounded-lg mb-2">
              <h3 className="font-bold text-lg">{proposals[id].description}</h3>
              <p className="text-muted-foreground">Submitted by: {proposals[id].submitter}</p>
              <p className="font-medium mt-2">Votes: {voteCounts[id]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Results</CardTitle>
          <CardDescription>Vote counts for all proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposals.map((proposal, index) => {
              const voteCount = voteCounts[index]
              const isWinner = winningProposalIds.includes(index)
              const percentage = votes.length > 0 ? (voteCount / votes.length) * 100 : 0

              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {proposal.description}
                      {isWinner && <span className="ml-2 text-yellow-500">(Winner)</span>}
                    </span>
                    <span>
                      {voteCount} vote{voteCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${isWinner ? "bg-yellow-500" : "bg-primary"}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of votes</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voting Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-muted-foreground">Total Proposals</h3>
              <p className="text-2xl font-bold">{proposals.length}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-muted-foreground">Total Votes Cast</h3>
              <p className="text-2xl font-bold">{votes.length}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-muted-foreground">Winning Vote Count</h3>
              <p className="text-2xl font-bold">{maxVotes}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

