"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { StatusSelect } from "@/components/ui/status-select"
import { Button } from "@/components/ui/button"
import type { Ticket } from "@/types"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface TicketsTableProps {
  tickets: Ticket[]
  isLoading: boolean
  onStatusChange?: (ticketId: string, newStatus: string) => void
}

const ITEMS_PER_PAGE = 10

export function TicketsTable({ tickets, isLoading, onStatusChange }: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => ticket.description.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [tickets, searchTerm])

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredTickets, currentPage])

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." className="max-w-sm" disabled />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset to first page when searching
          }}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                <TableCell>
                  <span className="capitalize">{ticket.type}</span>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate" title={ticket.description}>
                    {ticket.description}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusSelect ticketId={ticket.id} currentStatus={ticket.status} onStatusChange={onStatusChange} />
                </TableCell>
                <TableCell>
                  <span className="font-medium">{ticket.priority_score || 0}</span>
                </TableCell>
              </TableRow>
            ))}
            {paginatedTickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No tickets match your search." : "No tickets found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)} of {filteredTickets.length} tickets
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
