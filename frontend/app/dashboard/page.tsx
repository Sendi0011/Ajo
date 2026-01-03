"use client"

import { useAccount } from "wagmi"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { CompactActivityFeed } from "@/components/activity/activity-feed"
import { UpcomingPaymentsWidget } from "@/components/calendar/upcoming-payments-widget"
import { useEffect } from "react"

export default function DashboardPage() {
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3">
            <DashboardTabs />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            <CompactActivityFeed />
            <UpcomingPaymentsWidget />
          </div>
        </div>
      </main>
    </div>
  )
}