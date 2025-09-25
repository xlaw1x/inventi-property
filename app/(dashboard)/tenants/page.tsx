"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTickets, useServices } from "@/lib/hooks"
import type { Ticket, ServiceRequest } from "@/types"
import { Download, Search, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface UnitSummary {
  unitId: string
  lastRequester?: string
  openTickets: number
  lastActivity?: string
  building?: string
  floor?: string
  room?: string
}

export default function TenantsPage() {
  const { data: tickets, isLoading: ticketsLoading, error: ticketsError } = useTickets()
  const { data: services, isLoading: servicesLoading, error: servicesError } = useServices()
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const unitSummaries = useMemo(() => {
    if (!tickets && !services) return []

    const unitMap = new Map<string, UnitSummary>()

    // Process tickets
    if (tickets) {
      tickets.forEach((ticket: Ticket) => {
        if (!ticket.unit_id) return

        const existing = unitMap.get(ticket.unit_id) || {
          unitId: ticket.unit_id,
          openTickets: 0,
        }

        // Count open tickets
        if (["open", "assigned", "in_progress"].includes(ticket.status)) {
          existing.openTickets++
        }

        // Update last activity
        if (ticket.created_at) {
          if (!existing.lastActivity || new Date(ticket.created_at) > new Date(existing.lastActivity)) {
            existing.lastActivity = ticket.created_at
          }
        }

        unitMap.set(ticket.unit_id, existing)
      })
    }

    // Process service requests
    if (services) {
      services.forEach((service: ServiceRequest) => {
        if (!service.unit_id) return

        const existing = unitMap.get(service.unit_id) || {
          unitId: service.unit_id,
          openTickets: 0,
        }

        // Update last requester
        if (service.requester_name) {
          existing.lastRequester = service.requester_name
        }

        // Update last activity
        if (service.created_at) {
          if (!existing.lastActivity || new Date(service.created_at) > new Date(existing.lastActivity)) {
            existing.lastActivity = service.created_at
          }
        }

        unitMap.set(service.unit_id, existing)
      })
    }

    return Array.from(unitMap.values()).sort((a, b) => a.unitId.localeCompare(b.unitId))
  }, [tickets, services])

  const filteredUnits = useMemo(() => {
    return unitSummaries.filter((unit) => unit.unitId.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [unitSummaries, searchTerm])

  const exportToCsv = () => {
    const headers = ["Unit ID", "Last Requester", "Open Tickets", "Last Activity"]
    const csvContent = [
      headers.join(","),
      ...filteredUnits.map((unit) =>
        [
          unit.unitId,
          unit.lastRequester || "N/A",
          unit.openTickets,
          unit.lastActivity ? new Date(unit.lastActivity).toLocaleDateString() : "N/A",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tenants-summary-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleViewUnitTickets = (unitId: string) => {
    // Navigate to tickets page with unit filter
    router.push(`/tickets?unit=${encodeURIComponent(unitId)}`)
  }

  const isLoading = ticketsLoading || servicesLoading
  const hasError = ticketsError || servicesError

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tenants</h1>
          <Button onClick={exportToCsv} disabled>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
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
        <h1 className="text-3xl font-bold">Tenants</h1>
        <Button onClick={exportToCsv} disabled={isLoading || filteredUnits.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit Overview</CardTitle>
          <CardDescription>Summary of all units based on maintenance tickets and service requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {isLoading ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit ID</TableHead>
                      <TableHead>Last Requester</TableHead>
                      <TableHead>Open Tickets</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
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
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit ID</TableHead>
                      <TableHead>Last Requester</TableHead>
                      <TableHead>Open Tickets</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits.map((unit) => (
                      <TableRow key={unit.unitId}>
                        <TableCell className="font-mono">{unit.unitId}</TableCell>
                        <TableCell>{unit.lastRequester || "—"}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${unit.openTickets > 0 ? "text-red-600" : "text-green-600"}`}>
                            {unit.openTickets}
                          </span>
                        </TableCell>
                        <TableCell>
                          {unit.lastActivity ? new Date(unit.lastActivity).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUnitTickets(unit.unitId)}
                            disabled={unit.openTickets === 0}
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            View Tickets
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUnits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {searchTerm ? "No units match your search." : "No units found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && filteredUnits.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredUnits.length} unit{filteredUnits.length !== 1 ? "s" : ""}
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
