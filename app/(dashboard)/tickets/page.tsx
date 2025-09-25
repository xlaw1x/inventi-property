"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewTicketModal } from "@/components/tickets/new-ticket-modal"
import { TicketsTable } from "@/components/tickets/tickets-table"
import { useTickets } from "@/lib/hooks"
import type { Ticket } from "@/types"

export default function TicketsPage() {
  const { data: tickets, isLoading, error } = useTickets()
  const [optimisticTickets, setOptimisticTickets] = useState<Ticket[]>([])

  // Use optimistic updates for tickets
  const displayTickets = optimisticTickets.length > 0 ? optimisticTickets : tickets || []

  const ticketsByStatus = useMemo(() => {
    const grouped = {
      all: displayTickets,
      open: displayTickets.filter((t) => t.status === "open"),
      in_progress: displayTickets.filter((t) => t.status === "in_progress"),
      resolved: displayTickets.filter((t) => t.status === "resolved"),
      closed: displayTickets.filter((t) => t.status === "closed"),
    }
    return grouped
  }, [displayTickets])

  const handleOptimisticStatusChange = (ticketId: string, newStatus: string) => {
    if (tickets) {
      const updated = tickets.map((ticket: Ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus as Ticket["status"] } : ticket,
      )
      setOptimisticTickets(updated)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tickets</h1>
          <NewTicketModal />
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Unable to connect to API. Please check your backend connection.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <NewTicketModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tickets</CardTitle>
          <CardDescription>Manage and track all maintenance requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({ticketsByStatus.all.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({ticketsByStatus.open.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({ticketsByStatus.in_progress.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({ticketsByStatus.resolved.length})</TabsTrigger>
              <TabsTrigger value="closed">Closed ({ticketsByStatus.closed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TicketsTable
                tickets={ticketsByStatus.all}
                isLoading={isLoading}
                onStatusChange={handleOptimisticStatusChange}
              />
            </TabsContent>

            <TabsContent value="open">
              <TicketsTable
                tickets={ticketsByStatus.open}
                isLoading={isLoading}
                onStatusChange={handleOptimisticStatusChange}
              />
            </TabsContent>

            <TabsContent value="in_progress">
              <TicketsTable
                tickets={ticketsByStatus.in_progress}
                isLoading={isLoading}
                onStatusChange={handleOptimisticStatusChange}
              />
            </TabsContent>

            <TabsContent value="resolved">
              <TicketsTable
                tickets={ticketsByStatus.resolved}
                isLoading={isLoading}
                onStatusChange={handleOptimisticStatusChange}
              />
            </TabsContent>

            <TabsContent value="closed">
              <TicketsTable
                tickets={ticketsByStatus.closed}
                isLoading={isLoading}
                onStatusChange={handleOptimisticStatusChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
