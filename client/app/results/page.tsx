"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { VotingPhase, useVotingStore } from "@/lib/voting-store"
import { ResultsView } from "@/components/results-view"

export default function ResultsPage() {
  const { votingPhase } = useVotingStore()

  const resultsAvailable = votingPhase === VotingPhase.VotesTallied

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Voting Results</h1>

      {resultsAvailable ? (
        <ResultsView />
      ) : (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Results Not Available</AlertTitle>
          <AlertDescription>
            The voting process is still in progress. Results will be available once the votes have been tallied.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

