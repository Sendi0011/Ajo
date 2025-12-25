"use client"

import { useAccount } from "wagmi"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CalendarReminders } from "@/components/calendar/calendar-reminders"
import { useEffect } from "react"

export default function CalendarPage() {
  const { isConnected, isConnecting } = useAccount()

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      redirect("/")
    }
  }, [isConnected, isConnecting])

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CalendarReminders />
      </main>
    </div>
  )
}