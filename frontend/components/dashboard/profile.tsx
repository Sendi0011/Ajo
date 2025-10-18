"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAccount } from "wagmi"
import { Wallet, Award, TrendingUp, Users } from "lucide-react"

export function Profile() {
  const { address } = useAccount()

  // Mock profile data
  const profileData = {
    reputation: 95,
    totalSaved: "8.4 ETH",
    groupsJoined: 3,
    successfulPayouts: 12,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Profile</h2>
        <p className="text-muted-foreground mt-1">Your on-chain savings reputation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Wallet Address</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Reputation Score</span>
                <span className="text-2xl font-bold text-primary">{profileData.reputation}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${profileData.reputation}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                <Award className="h-3 w-3 mr-1" />
                Trusted Member
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">Savings Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Saved</span>
              </div>
              <span className="text-lg font-bold">{profileData.totalSaved}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Groups Joined</span>
              </div>
              <span className="text-lg font-bold">{profileData.groupsJoined}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Successful Payouts</span>
              </div>
              <span className="text-lg font-bold">{profileData.successfulPayouts}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">About Reputation Score</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Your reputation score is calculated based on your on-chain savings history. A higher score unlocks benefits
          like:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
            <span className="text-muted-foreground">Access to premium savings groups</span>
          </li>
          <li className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
            <span className="text-muted-foreground">Lower fees on transactions</span>
          </li>
          <li className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
            <span className="text-muted-foreground">Eligibility for microcredit loans</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
