"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { useCreateRotational } from "@/hooks/useBaseSafeContracts"

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0xaA36d07B2292950f7CE3C2b28e6E09D15A38d201"
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x408d5D0C25E588875D818f3161b3326D5d18EcAd"

export function RotationalForm() {
  const router = useRouter()
  const { address } = useAccount()
  const [members, setMembers] = useState<string[]>([""])
  const [error, setError] = useState("")
  const [isSavingToDB, setIsSavingToDB] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contributionAmount: "",
    frequency: "weekly",
    startDate: "",
  })

  const validMembers = members.filter((m) => m && m.startsWith("0x") && m.length === 42)
  const { create, isLoading, isSuccess, hash } = useCreateRotational(
    validMembers,
    formData.contributionAmount,
    formData.frequency,
    100,
    100
  )

  const frequencyMap: Record<string, number> = {
    daily: 86400,
    weekly: 604800,
    biweekly: 1209600,
    monthly: 2592000,
  }

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
    setError("")

    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    if (validMembers.length < 2) {
      setError("Need at least 2 valid members (0x...)")
      return
    }

    if (!formData.name) {
      setError("Please enter group name")
      return
    }

    if (!formData.contributionAmount) {
      setError("Please enter contribution amount")
      return
    }

    if (create) {
      create()
    }
  }

  // Save to database after contract deployment
  const hasAttemptedSave = useRef(false)

useEffect(() => {
  if (isSuccess && hash && !isSavingToDB && !hasAttemptedSave.current) {
    hasAttemptedSave.current = true
    setIsSavingToDB(true)
    savePoolToDB()
  }
}, [isSuccess, hash, isSavingToDB])

  const savePoolToDB = async () => {
    try {
      if (!address) throw new Error("No wallet address")

      const response = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          poolType: "rotational",
          creatorAddress: address,
          contractAddress: "0x" + Math.random().toString(16).slice(2), // Replace with actual contract address from event
          tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
          members: validMembers,
          contributionAmount: formData.contributionAmount,
          roundDuration: frequencyMap[formData.frequency],
          frequency: formData.frequency,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save pool")
      }

      const pool = await response.json()
      setIsSavingToDB(false)
      
      // Redirect to the new pool
      setTimeout(() => {
        router.push(`/dashboard/group/${pool.id}`)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pool")
      setIsSavingToDB(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

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
            <li>Total Members: {validMembers.length}</li>
            <li>Contribution per Member: {formData.contributionAmount || "0"} ETH</li>
            <li>Payout Frequency: {formData.frequency}</li>
            <li>
              Total Pool:{" "}
              {(Number.parseFloat(formData.contributionAmount || "0") * validMembers.length).toFixed(2)} ETH
            </li>
          </ul>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || isSavingToDB}>
          {isLoading || isSavingToDB ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSavingToDB ? "Saving to database..." : "Creating Group..."}
            </>
          ) : (
            "Create Rotational Group"
          )}
        </Button>
        {hash && <p className="text-xs text-green-600 mt-2">TX: {hash.slice(0, 20)}...</p>}
      </div>
    </form>
  )
}
