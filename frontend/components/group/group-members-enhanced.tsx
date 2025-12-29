"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2, 
  TrendingUp,
  Award,
  Crown,
  UserPlus,
  Eye
} from "lucide-react"
import { useState, useEffect } from "react"
import { QRInviteDialog } from "./qr-invite-dialog"
import Link from "next/link"

interface Member {
  id: string
  member_address: string
  contribution_amount: number
  status: 'pending' | 'paid' | 'late'
  joined_at: string
  invited_by: string | null
  profile?: {
    display_name: string | null
    reputation_score: number
    avatar_url: string | null
    on_time_payments: number
    total_groups_joined: number
  }
}

interface Pool {
  id: string
  name: string
  creator_address: string
}

export function GroupMembersEnhanced({ groupId }: { groupId: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [groupId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/pools?id=${groupId}`)
      const poolData = await response.json()

      setPool(poolData)

      if (poolData.pool_members) {
        // Fetch profile data for each member
        const membersWithProfiles = await Promise.all(
          poolData.pool_members.map(async (member: Member) => {
            try {
              const profileRes = await fetch(`/api/profiles?address=${member.member_address}`)
              const profileData = await profileRes.json()
              return {
                ...member,
                profile: profileData.profile,
              }
            } catch (error) {
              return member
            }
          })
        )
        setMembers(membersWithProfiles)
      }
    } catch (err) {
      console.error('Failed to fetch members:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getReputationBadge = (score: number) => {
    if (score >= 90) return { label: "Elite", color: "bg-yellow-500/10 text-yellow-500" }
    if (score >= 75) return { label: "Trusted", color: "bg-green-500/10 text-green-500" }
    if (score >= 50) return { label: "Reliable", color: "bg-blue-500/10 text-blue-500" }
    return { label: "Building", color: "bg-gray-500/10 text-gray-500" }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Members ({members.length})</h3>
          {pool && (
            <QRInviteDialog poolId={pool.id} poolName={pool.name} />
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No members yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Invite members using the button above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const repBadge = member.profile 
                ? getReputationBadge(member.profile.reputation_score)
                : null
              const isCreator = pool?.creator_address.toLowerCase() === member.member_address.toLowerCase()

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {member.profile?.display_name 
                          ? member.profile.display_name.charAt(0).toUpperCase()
                          : member.member_address.slice(2, 4).toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {member.profile?.display_name || formatAddress(member.member_address)}
                        </p>
                        {isCreator && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Creator
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatAddress(member.member_address)}
                        </p>
                        
                        {member.profile && repBadge && (
                          <Badge className={`${repBadge.color} border-none text-xs`}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {member.profile.reputation_score}
                          </Badge>
                        )}

                        {member.profile && member.profile.on_time_payments > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {member.profile.on_time_payments} payments
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        Contribution: {member.contribution_amount.toFixed(2)} ETH
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                      {getStatusIcon(member.status)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.status}
                      </span>
                    </div>

                    <Link href={`/profile/${member.member_address}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Member Stats Card */}
      {members.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Group Statistics</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-500">
                {members.filter(m => m.status === 'paid').length}
              </p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">
                {members.filter(m => m.status === 'late').length}
              </p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">
                {members.filter(m => m.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>

          {members.some(m => m.profile) && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. Reputation</span>
                <span className="font-bold text-primary">
                  {Math.round(
                    members
                      .filter(m => m.profile)
                      .reduce((sum, m) => sum + (m.profile?.reputation_score || 0), 0) /
                    members.filter(m => m.profile).length
                  )}
                </span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}