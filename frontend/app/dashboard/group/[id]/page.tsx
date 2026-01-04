"use client"

import { use, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { GroupDetails } from "@/components/group/group-details"
import { GroupMembers } from "@/components/group/group-members"
import { GroupActivity } from "@/components/group/group-activity"
import { GroupActions } from "@/components/group/group-actions"
import { GroupChat } from "@/components/chat/group-chat"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Pool {
  id: string
  name: string
  type: 'rotational' | 'target' | 'flexible'
  contract_address: string
  token_address: string
  pool_members?: Array<{
    member_address: string
  }>
}

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/pools?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setPool(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load pool:', err)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!pool) return <div>Pool not found</div>

  // Extract member addresses for chat
  const memberAddresses = pool.pool_members?.map(m => m.member_address) || []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Chat Button - NEW! 🎉 */}
          <GroupChat 
            poolId={id}
            poolName={pool.name}
            memberAddresses={memberAddresses}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GroupDetails groupId={id} />
            <GroupActivity groupId={id} />
          </div>
          <div className="space-y-6">
            <GroupActions 
              groupId={id}
              poolAddress={pool.contract_address}
              poolType={pool.type}
              tokenAddress={pool.token_address}
              totalMembers={memberAddresses.length}
              poolName={pool.name}
            />
            <GroupMembers groupId={id} />
          </div>
        </div>
      </main>
    </div>
  )
}