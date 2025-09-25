"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD

    console.log("[v0] Demo email from env:", demoEmail)
    console.log("[v0] Demo password from env:", demoPassword)
    console.log("[v0] User entered email:", email)
    console.log("[v0] User entered password:", password)

    if (email === demoEmail && password === demoPassword) {
      // Set session cookie
      document.cookie = "pm_session=1; path=/; max-age=86400; SameSite=Lax"
      toast({
        title: "Login successful",
        description: "Welcome to Property Manager!",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Property Ops</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {demoEmail && demoPassword && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-800 mb-1">Demo Credentials:</p>
              <p className="text-xs text-blue-600">Email: {demoEmail}</p>
              <p className="text-xs text-blue-600">Password: {demoPassword}</p>
            </div>
          )}

          {(!demoEmail || !demoPassword) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-1">Configuration Error:</p>
              <p className="text-xs text-red-600">
                Environment variables not set. Please configure NEXT_PUBLIC_DEMO_EMAIL and NEXT_PUBLIC_DEMO_PASSWORD.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="manager@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
