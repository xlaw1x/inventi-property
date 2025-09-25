"use client"

import { KpiCard } from "@/components/ui/kpi-card"
import { StatusSelect } from "@/components/ui/status-select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTickets, useIncidents, useDeliveries, useDeliveryStats } from "@/lib/hooks"
import type { Ticket } from "@/types"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ClipboardList,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Calendar,
  Activity,
  Package,
} from "lucide-react"
import { mockDashboardStats, mockChartData, mockRecentActivities, mockUpcomingTasks } from "@/lib/mock-data"

type DateRangeType = "daily" | "weekly" | "monthly" | "yearly"

export default function DashboardPage() {
  const { data: tickets, isLoading: ticketsLoading, error: ticketsError } = useTickets()
  const { data: incidents, isLoading: incidentsLoading } = useIncidents()
  const { data: deliveries, isLoading: deliveriesLoading } = useDeliveries()
  const { data: deliveryStats, isLoading: deliveryStatsLoading } = useDeliveryStats()
  const [optimisticTickets, setOptimisticTickets] = useState<Ticket[]>([])
  const [deliveryDateRange, setDeliveryDateRange] = useState<DateRangeType>("daily")

  const displayTickets = optimisticTickets.length > 0 ? optimisticTickets : tickets || []

  const kpis = useMemo(() => {
    if (!displayTickets.length) return mockDashboardStats

    const openStatuses = ["open", "assigned", "in_progress"]
    const openCount = displayTickets.filter((ticket) => openStatuses.includes(ticket.status)).length
    const resolvedToday = displayTickets.filter((ticket) => ticket.status === "resolved").length

    return {
      ...mockDashboardStats,
      openCount,
      resolvedToday,
    }
  }, [displayTickets])

  const deliveryMetrics = useMemo(() => {
    if (deliveryStats) {
      return {
        overdueDeliveries: deliveryStats.overdueDeliveries,
        totalDeliveries: deliveryStats.totalDeliveries,
        avgOverdueDays: deliveryStats.avgOverdueDays,
        onTimeDeliveries: deliveryStats.onTimeDeliveries,
      }
    }

    if (!deliveries || deliveries.length === 0) {
      return {
        overdueDeliveries: mockDashboardStats.overdueDeliveries,
        totalDeliveries: mockDashboardStats.totalDeliveries,
        avgOverdueDays: 3.2,
        onTimeDeliveries: 4,
      }
    }

    const now = new Date()
    const pendingDeliveries = deliveries.filter((d: any) => d.status === "pending" || d.status === "approved")

    const overdueDeliveries = pendingDeliveries.filter((d: any) => {
      if (!d.expected_delivery_date) return false
      return new Date(d.expected_delivery_date) < now
    })

    const completedDeliveries = deliveries.filter((d: any) => d.status === "completed")
    const onTimeDeliveries = completedDeliveries.filter((d: any) => {
      if (!d.completed_at || !d.expected_delivery_date) return true
      return new Date(d.completed_at) <= new Date(d.expected_delivery_date)
    })

    const totalOverdueDays = overdueDeliveries.reduce((sum: number, d: any) => {
      const expectedDate = new Date(d.expected_delivery_date)
      const daysDiff = Math.ceil((now.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24))
      return sum + daysDiff
    }, 0)

    const avgOverdueDays = overdueDeliveries.length > 0 ? totalOverdueDays / overdueDeliveries.length : 0

    return {
      overdueDeliveries: overdueDeliveries.length,
      totalDeliveries: deliveries.length,
      avgOverdueDays: Math.round(avgOverdueDays * 10) / 10,
      onTimeDeliveries: onTimeDeliveries.length,
    }
  }, [deliveries, deliveryStats])

  const deliveryChartData = useMemo(() => {
    if (!deliveries || deliveries.length === 0) {
      return [{ period: "Current", overdue: 2, onTime: 4 }]
    }

    const now = new Date()

    const groupDeliveriesByPeriod = (deliveries: any[], dateRange: DateRangeType) => {
      const groups: { [key: string]: { overdue: number; onTime: number } } = {}

      deliveries.forEach((delivery: any) => {
        const deliveryDate = new Date(delivery.expected_delivery_date || delivery.created_at)
        let periodKey: string

        switch (dateRange) {
          case "daily":
            periodKey = deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            break
          case "weekly":
            const weekStart = new Date(deliveryDate)
            weekStart.setDate(deliveryDate.getDate() - deliveryDate.getDay())
            periodKey = `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            break
          case "monthly":
            periodKey = deliveryDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
            break
          case "yearly":
            periodKey = deliveryDate.getFullYear().toString()
            break
          default:
            periodKey = "Current"
        }

        if (!groups[periodKey]) {
          groups[periodKey] = { overdue: 0, onTime: 0 }
        }

        const isOverdue =
          delivery.isOverdue ||
          ((delivery.status === "pending" || delivery.status === "approved") &&
            delivery.expected_delivery_date &&
            new Date(delivery.expected_delivery_date) < now)

        const isOnTime =
          delivery.status === "completed" ||
          (!isOverdue && delivery.expected_delivery_date && new Date(delivery.expected_delivery_date) >= now)

        if (isOverdue) {
          groups[periodKey].overdue++
        } else if (isOnTime) {
          groups[periodKey].onTime++
        }
      })

      return Object.entries(groups)
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period))
        .slice(-10)
    }

    return groupDeliveriesByPeriod(deliveries, deliveryDateRange)
  }, [deliveries, deliveryDateRange])

  const chartData = useMemo(() => {
    if (!displayTickets.length) return mockChartData.ticketsByMonth

    const openCount = displayTickets.filter((ticket) =>
      ["open", "assigned", "in_progress"].includes(ticket.status),
    ).length
    const resolvedCount = displayTickets.filter((ticket) => ticket.status === "resolved").length

    return [
      { name: "Open", count: openCount },
      { name: "Resolved", count: resolvedCount },
    ]
  }, [displayTickets])

  const topPriorityTickets = useMemo(() => {
    return [...displayTickets].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)).slice(0, 10)
  }, [displayTickets])

  const handleOptimisticStatusChange = (ticketId: string, newStatus: string) => {
    if (tickets) {
      const updated = tickets.map((ticket: Ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus as Ticket["status"] } : ticket,
      )
      setOptimisticTickets(updated)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (ticketsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
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
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your property management operations</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard
          label="Open Tickets"
          value={ticketsLoading ? "..." : kpis.openTickets}
          description="Active maintenance requests"
          icon={<ClipboardList className="h-5 w-5" />}
          trend="up"
        />
        <KpiCard
          label="Resolved Today"
          value={ticketsLoading ? "..." : kpis.resolvedToday}
          description="Completed tickets"
          icon={<CheckCircle className="h-5 w-5" />}
          trend="up"
        />
        <KpiCard
          label="Response Time"
          value={`${kpis.responseTime}h`}
          description="Average response time"
          icon={<Clock className="h-5 w-5" />}
          trend="down"
        />
        <KpiCard
          label="Satisfaction"
          value={`${kpis.satisfactionRate}/5`}
          description="Average tenant rating (1-5 stars)"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <KpiCard
          label="Overdue Deliveries"
          value={deliveriesLoading || deliveryStatsLoading ? "..." : deliveryMetrics.overdueDeliveries}
          description={`Avg ${deliveryMetrics.avgOverdueDays} days overdue`}
          icon={<Package className="h-5 w-5" />}
          trend={deliveryMetrics.overdueDeliveries > 0 ? "up" : "neutral"}
        />
        <KpiCard
          label="Total Deliveries"
          value={deliveriesLoading || deliveryStatsLoading ? "..." : deliveryMetrics.totalDeliveries}
          description={`${deliveryMetrics.onTimeDeliveries} completed on time`}
          icon={<Package className="h-5 w-5" />}
          trend="neutral"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Monthly Ticket Trends</CardTitle>
            <CardDescription className="text-sm">Ticket volume and resolution trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData.ticketsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    dataKey="tickets"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    name="Total Tickets"
                  />
                  <Line
                    dataKey="resolved"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                    name="Resolved Tickets"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Tickets by Category</CardTitle>
            <CardDescription className="text-sm">Distribution of ticket types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockChartData.ticketsByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {mockChartData.ticketsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {mockChartData.ticketsByCategory.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-muted-foreground">
                    {item.category}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <CardTitle className="text-lg font-semibold">Delivery Status</CardTitle>
              </div>
              <Select value={deliveryDateRange} onValueChange={(value: DateRangeType) => setDeliveryDateRange(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription className="text-sm">
              Overdue vs On-time deliveries by {deliveryDateRange} period (Real CSV Data)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveriesLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="overdue" stackId="a" fill="#ef4444" name="Overdue" />
                  <Bar dataKey="onTime" stackId="a" fill="#10b981" name="On Time" />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">
                  Overdue: {deliveryChartData.reduce((sum, item) => sum + item.overdue, 0)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">
                  On Time: {deliveryChartData.reduce((sum, item) => sum + item.onTime, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription className="text-sm">Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === "ticket_created" && <ClipboardList className="h-4 w-4 text-blue-500" />}
                    {activity.type === "ticket_resolved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.type === "payment_received" && <DollarSign className="h-4 w-4 text-green-600" />}
                    {activity.type === "inspection_scheduled" && <Calendar className="h-4 w-4 text-orange-500" />}
                    {activity.type === "lease_renewal" && <Users className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                      {activity.priority && (
                        <Badge
                          variant={
                            activity.priority === "high"
                              ? "destructive"
                              : activity.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {activity.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription className="text-sm">Scheduled tasks and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUpcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{task.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Due: {formatDate(task.dueDate)}</span>
                      <span>Assignee: {task.assignee}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">{task.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Incidents
            </CardTitle>
            <CardDescription className="text-sm">Critical issues and incidents</CardDescription>
          </CardHeader>
          <CardContent>
            {incidentsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ) : incidents && incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.slice(0, 5).map((incident: any) => (
                  <div
                    key={incident.id}
                    className="flex justify-between items-start p-4 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{incident.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge
                          variant={
                            incident.severity === "critical"
                              ? "destructive"
                              : incident.severity === "high"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {incident.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Status: <span className="font-medium">{incident.status}</span>
                        </span>
                        {incident.affected_units && (
                          <span className="text-xs text-muted-foreground">
                            Affects: {incident.affected_units.length} units
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No recent incidents</p>
                <p className="text-xs text-muted-foreground mt-1">All systems operating normally</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">High Priority Tickets</CardTitle>
          <CardDescription className="text-sm">Top 10 tickets by priority score</CardDescription>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="min-w-[80px] font-semibold">ID</TableHead>
                    <TableHead className="min-w-[100px] font-semibold">Type</TableHead>
                    <TableHead className="min-w-[200px] font-semibold">Description</TableHead>
                    <TableHead className="min-w-[100px] font-semibold">Tenant</TableHead>
                    <TableHead className="min-w-[140px] font-semibold">Status</TableHead>
                    <TableHead className="min-w-[80px] font-semibold">Priority</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPriorityTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-mono text-sm font-medium">{ticket.id}</TableCell>
                      <TableCell className="font-medium">{ticket.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                      <TableCell className="text-sm">{ticket.tenant_name || ticket.room_number || "N/A"}</TableCell>
                      <TableCell>
                        <StatusSelect
                          ticketId={ticket.id}
                          currentStatus={ticket.status}
                          onStatusChange={(newStatus) => handleOptimisticStatusChange(ticket.id, newStatus)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.severity === "high"
                              ? "destructive"
                              : ticket.severity === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {ticket.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{ticket.assigned_to || "Unassigned"}</TableCell>
                    </TableRow>
                  ))}
                  {topPriorityTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
