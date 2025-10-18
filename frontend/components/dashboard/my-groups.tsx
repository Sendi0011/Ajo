"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Mock data - will be replaced with real data from smart contracts
const mockGroups = [
  {
    id: "1",
    name: "Family Savings Circle",
    type: "Rotational",
    members: 8,
    totalSaved: "2.5 ETH",
    nextPayout: "3 days",
    status: "active",
    progress: 75,
  },
  {
    id: "2",
    name: "Business Investment Pool",
    type: "Target",
    members: 12,
    totalSaved: "5.2 ETH",
    nextPayout: "15 days",
    status: "active",
    progress: 45,
  },
  {
    id: "3",
    name: "Community Emergency Fund",
    type: "Flexible",
    members: 25,
    totalSaved: "8.7 ETH",
    nextPayout: "Anytime",
    status: "active",
    progress: 100,
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function MyGroups() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold">My Groups</h2>
          <p className="text-muted-foreground mt-1">Manage your savings circles</p>
        </div>
      </motion.div>

      {mockGroups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first savings group or join an existing one to get started
              </p>
              <Button className="bg-primary hover:bg-primary/90">Create Your First Group</Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mockGroups.map((group) => (
            <motion.div key={group.id} variants={item}>
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{group.name}</h3>
                    <Badge variant="secondary">{group.type}</Badge>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{group.status}</Badge>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Members
                    </span>
                    <span className="font-medium">{group.members}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Total Saved
                    </span>
                    <span className="font-medium">{group.totalSaved}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Next Payout
                    </span>
                    <span className="font-medium">{group.nextPayout}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{group.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${group.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>

                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href={`/dashboard/group/${group.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
