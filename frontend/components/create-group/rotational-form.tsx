"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function RotationalForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<string[]>([""])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contributionAmount: "",
    frequency: "weekly",
    startDate: "",
  })

  const addMember = () => {
    setMembers([...members, ""])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, value: string) => {
    const newMembers = [...members]
    newMembers[index] = value
    setMembers(newMembers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate smart contract deployment
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("[v0] Creating rotational group:", { ...formData, members })
    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Group Name</Label>
        <Input
          id="name"
          placeholder="e.g., Family Savings Circle"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose of this savings group"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Contribution Amount (ETH)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.5"
            value={formData.contributionAmount}
            onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Payout Frequency</Label>
          <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Member Wallet Addresses</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMember}>
            <Plus className="h-4 w-4 mr-1" />
            Add Member
          </Button>
        </div>

        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="0x..."
                value={member}
                onChange={(e) => updateMember(index, e.target.value)}
                required
              />
              {members.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-border">
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2">Summary</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Total Members: {members.filter((m) => m).length}</li>
            <li>Contribution per Member: {formData.contributionAmount || "0"} ETH</li>
            <li>Payout Frequency: {formData.frequency}</li>
            <li>
              Total Pool:{" "}
              {(Number.parseFloat(formData.contributionAmount || "0") * members.filter((m) => m).length).toFixed(2)} ETH
            </li>
          </ul>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Group...
            </>
          ) : (
            "Create Rotational Group"
          )}
        </Button>
      </div>
    </form>
  )
}
