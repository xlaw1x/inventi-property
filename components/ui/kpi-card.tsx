import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KpiCardProps {
  label: string
  value: string | number
  description?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
}

export function KpiCard({ label, value, description, trend, icon }: KpiCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "neutral":
        return <Minus className="h-4 w-4 text-gray-400" />
      default:
        return null
    }
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{label}</CardTitle>
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          {getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-accent/20" />
    </Card>
  )
}
