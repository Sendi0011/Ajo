"use client"

import { use } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { GroupDetails } from "@/components/group/group-details"
import { GroupMembers } from "@/components/group/group-members"
import { GroupActivity } from "@/components/group/group-activity"
import { GroupActions } from "@/components/group/group-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // TODO: Fetch from your backend/database
  // For now, these should come from your DB when you save pool creation
  const poolAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x0" // Replace with actual pool address
  const poolType: "rotational" | "target" | "flexible" = "rotational" // Replace with actual type
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x0"

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GroupDetails groupId={id} />
            <GroupActivity groupId={id} />
          </div>
          <div className="space-y-6">
            <GroupActions 
              groupId={id}
              poolAddress={poolAddress}
              poolType={poolType}
              tokenAddress={tokenAddress}
            />
            <GroupMembers groupId={id} />
          </div>
        </div>
      </main>
    </div>
  )
}