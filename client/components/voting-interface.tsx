"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { useVotingStore } from "@/lib/voting-store"

interface VotingInterfaceProps {
  voterAddress: string
}

export function VotingInterface({ voterAddress }: VotingInterfaceProps) {
  const { proposals, castVote } = useVotingStore()
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null)
  const [voted, setVoted] = useState(false)

  const handleVote = () => {
    if (selectedProposal === null) return

    castVote(voterAddress, selectedProposal)
    setVoted(true)
  }

  if (voted) {
    return (
      <Alert className="border-green-500 text-green-500">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Vote Cast</AlertTitle>
        <AlertDescription>Your vote has been successfully recorded</AlertDescription>
      </Alert>
    )
  }

  if (proposals.length === 0) {
    return <p className="text-muted-foreground">No proposals available to vote on.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>Select one proposal to vote for</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedProposal?.toString()}
          onValueChange={(value) => setSelectedProposal(Number.parseInt(value))}
        >
          {proposals.map((proposal, index) => (
            <div key={index} className="flex items-center space-x-2 py-2">
              <RadioGroupItem value={index.toString()} id={`proposal-${index}`} />
              <Label htmlFor={`proposal-${index}`} className="flex-1">
                <div className="font-medium">{proposal.description}</div>
                <div className="text-sm text-muted-foreground">Proposal #{index + 1}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleVote} disabled={selectedProposal === null} className="w-full">
          Cast Vote
        </Button>
      </CardFooter>
    </Card>
  )
}

