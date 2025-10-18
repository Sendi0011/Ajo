"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function TargetForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<string[]>([""])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    deadline: "",
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

    console.log("[v0] Creating target pool group:", { ...formData, members })
    setIsLoading(false)
    router.push("/dashboard")
  }

  const contributionPerMember =
    members.filter((m) => m).length > 0
      ? (Number.parseFloat(formData.targetAmount || "0") / members.filter((m) => m).length).toFixed(4)
      : "0"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Group Name</Label>
        <Input
          id="name"
          placeholder="e.g., Wedding Fund"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe the savings goal"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target">Target Amount (ETH)</Label>
          <Input
            id="target"
            type="number"
            step="0.01"
            placeholder="10.0"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Target Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
          />
        </div>
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
            <li>Target Amount: {formData.targetAmount || "0"} ETH</li>
            <li>Contribution per Member: {contributionPerMember} ETH</li>
            <li>Deadline: {formData.deadline || "Not set"}</li>
          </ul>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Group...
            </>
          ) : (
            "Create Target Pool"
          )}
        </Button>
      </div>
    </form>
  )
}
