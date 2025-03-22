"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { VotingPhase, useVotingStore } from "@/lib/voting-store"
import { ResultsView } from "@/components/results-view"
import Navbar from "@/components/navbar"

export default function ResultsPage() {
  const { votingPhase } = useVotingStore()

  const resultsAvailable = votingPhase === VotingPhase.VotesTallied

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-800 text-white">
      <Navbar />
      <div className="flex-grow flex flex-col items-center pt-24"> {/* Ajout de pt-32 pour ajouter un padding-top */}
        <h1 className="text-3xl font-bold mb-8 text-white">Voting Results</h1>

        <div className="container text-center">
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
      </div>
    </div>
  )
}