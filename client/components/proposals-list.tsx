"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useVotingStore } from "@/lib/voting-store"

export function ProposalsList() {
  const { proposals } = useVotingStore()

  if (proposals.length === 0) {
    return <p className="text-muted-foreground">No proposals submitted yet.</p>
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Submission Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{proposal.description}</TableCell>
              <TableCell className="font-mono">{proposal.submitter}</TableCell>
              <TableCell>{new Date(proposal.submittedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

