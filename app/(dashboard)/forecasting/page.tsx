"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { AlertTriangle, Calendar, Users, Wrench, DollarSign, Target, Activity, Zap, Loader2 } from "lucide-react"
import { mockFailurePredictions, mockMaintenanceSchedule, mockManpowerPlanning } from "@/lib/mock-data"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function ForecastingPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [filteredPredictions, setFilteredPredictions] = useState(mockFailurePredictions)
  const [filteredSchedule, setFilteredSchedule] = useState(mockMaintenanceSchedule)

  useEffect(() => {
    const today = new Date()
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    setStartDate(today.toISOString().split("T")[0])
    setEndDate(thirtyDaysLater.toISOString().split("T")[0])
  }, [])

  const runMLAnalysis = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }

    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const start = new Date(startDate)
    const end = new Date(endDate)

    const filtered = mockFailurePredictions.filter((prediction) => {
      const predictionDate = new Date(prediction.predictedFailureDate)
      return predictionDate >= start && predictionDate <= end
    })

    const filteredMaintenance = mockMaintenanceSchedule.filter((task) => {
      const taskDate = new Date(task.scheduledDate)
      return taskDate >= start && taskDate <= end
    })

    setFilteredPredictions(filtered)
    setFilteredSchedule(filteredMaintenance)
    setIsLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "destructive"
      case "scheduled":
        return "default"
      case "planned":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ML Forecasting & Maintenance Planning</h1>
          <p className="text-sm text-muted-foreground">
            Predictive analytics for equipment failures and optimized maintenance scheduling
          </p>
        </div>
        <Button onClick={runMLAnalysis} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Analysis...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Run ML Analysis
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            ML Analysis Date Range
          </CardTitle>
          <CardDescription>
            Select a date range to run ML predictions and generate maintenance forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
          {startDate && endDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Analyzing period: {formatDate(startDate)} to {formatDate(endDate)}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Predictions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPredictions.filter((p) => p.riskLevel === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Equipment at high risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(1250000)}</div>
            <p className="text-xs text-muted-foreground">Through preventive maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSchedule.length}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Current workload</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Failure Predictions</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
          <TabsTrigger value="manpower">Manpower Planning</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Equipment Failure Predictions
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                ML-powered predictions of equipment failures based on historical data and usage patterns
                {filteredPredictions.length > 0 && (
                  <span className="block mt-1">
                    Showing {filteredPredictions.length} prediction(s) for selected date range
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPredictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No predictions found for the selected date range. Try expanding your date range or run a new analysis.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPredictions.map((prediction) => (
                    <div key={prediction.equipmentId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{prediction.equipmentName}</h3>
                          <p className="text-sm text-muted-foreground">{prediction.failureType}</p>
                        </div>
                        <Badge
                          variant={
                            prediction.riskLevel === "critical"
                              ? "destructive"
                              : prediction.riskLevel === "high"
                                ? "destructive"
                                : prediction.riskLevel === "medium"
                                  ? "default"
                                  : "secondary"
                          }
                        >
                          {prediction.riskLevel}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Failure Probability</p>
                          <div className="flex items-center gap-2">
                            <Progress value={prediction.probabilityPercent} className="flex-1" />
                            <span className="font-medium">{prediction.probabilityPercent}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Predicted Date</p>
                          <p className="font-medium">{formatDate(prediction.predictedFailureDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Days Until Failure</p>
                          <p className="font-medium">{prediction.daysUntilFailure} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Estimated Cost</p>
                          <p className="font-medium">{formatCurrency(prediction.estimatedCost)}</p>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-sm font-medium mb-1">Recommended Action:</p>
                        <p className="text-sm text-muted-foreground">{prediction.recommendedAction}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Affects: {prediction.impactedUnits.join(", ")}
                        </div>
                        <Button size="sm">Schedule Maintenance</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Preventive Maintenance Schedule
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Optimized maintenance schedule based on ML predictions and equipment condition
                {filteredSchedule.length > 0 && (
                  <span className="block mt-1">Showing {filteredSchedule.length} task(s) for selected date range</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSchedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No maintenance tasks scheduled for the selected date range. Try expanding your date range.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSchedule.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{task.equipmentName}</h3>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Scheduled Date</p>
                          <p className="font-medium">{formatDate(task.scheduledDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{task.estimatedDuration} hours</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">{formatCurrency(task.cost)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Priority</p>
                          <Badge
                            variant={
                              task.priority === "critical"
                                ? "destructive"
                                : task.priority === "high"
                                  ? "destructive"
                                  : "default"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {task.requiredSkills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Assigned: {task.assignedTechnicians.join(", ")}
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manpower" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Current Staff
                </CardTitle>
                <CardDescription>Available technicians and their current workload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockManpowerPlanning.currentStaff.map((staff) => (
                    <div key={staff.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{staff.name}</h4>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                        <Badge variant={staff.availability === "available" ? "default" : "secondary"}>
                          {staff.availability}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Workload</span>
                          <span>{staff.currentWorkload}%</span>
                        </div>
                        <Progress value={staff.currentWorkload} />
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {staff.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Staffing Recommendations
                </CardTitle>
                <CardDescription>AI-powered staffing optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockManpowerPlanning.staffingRecommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{rec.period}</h4>
                          <p className="text-sm text-muted-foreground">{rec.recommendedAction}</p>
                        </div>
                        <Badge variant={rec.urgency === "high" ? "destructive" : "default"}>{rec.urgency}</Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Estimated Cost:</span>
                        <span className="font-medium">{formatCurrency(rec.estimatedCost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workload Forecast</CardTitle>
              <CardDescription>Predicted workload vs available capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockManpowerPlanning.workloadForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="plannedHours" fill="#3b82f6" name="Planned Hours" />
                  <Bar dataKey="availableHours" fill="#10b981" name="Available Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Health Trend</CardTitle>
                <CardDescription>Overall equipment condition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { month: "Aug", health: 85, predicted: 82 },
                      { month: "Sep", health: 83, predicted: 79 },
                      { month: "Oct", health: 81, predicted: 76 },
                      { month: "Nov", health: 78, predicted: 73 },
                      { month: "Dec", health: 76, predicted: 70 },
                      { month: "Jan", health: 74, predicted: 67 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="health" stroke="#3b82f6" name="Current Health" />
                    <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeDasharray="5 5" name="Predicted" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Cost Savings</CardTitle>
                <CardDescription>Preventive vs reactive maintenance costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { month: "Aug", preventive: 450000, reactive: 1200000 },
                      { month: "Sep", preventive: 520000, reactive: 980000 },
                      { month: "Oct", preventive: 480000, reactive: 1100000 },
                      { month: "Nov", preventive: 600000, reactive: 850000 },
                      { month: "Dec", preventive: 550000, reactive: 750000 },
                      { month: "Jan", preventive: 650000, reactive: 600000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="preventive" fill="#10b981" name="Preventive" />
                    <Bar dataKey="reactive" fill="#ef4444" name="Reactive" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
