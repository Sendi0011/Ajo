"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { useCreateTarget } from "@/hooks/useBaseSafeContracts"

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x408d5D0C25E588875D818f3161b3326D5d18EcAd"

export function TargetForm() {
  const router = useRouter()
  const { address } = useAccount()
  const [members, setMembers] = useState<string[]>([""])
  const [error, setError] = useState("")
  const [isSavingToDB, setIsSavingToDB] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    deadline: "",
  })

  const validMembers = members.filter((m: string) => m && m.startsWith("0x") && m.length === 42)
  const deadlineDate = formData.deadline ? new Date(formData.deadline) : null

  const { create, isLoading, isSuccess, hash, poolAddress } = useCreateTarget(
    validMembers,
    formData.targetAmount,
    deadlineDate || new Date(),
    100
  )

  const addMember = () => {
    setMembers([...members, ""])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_: string, i: number) => i !== index))
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

    if (!formData.targetAmount) {
      setError("Please enter target amount")
      return
    }

    if (!formData.deadline) {
      setError("Please select a deadline")
      return
    }

    if (new Date(formData.deadline) <= new Date()) {
      setError("Deadline must be in the future")
      return
    }

    if (create) {
      create()
    }
  }

  const hasAttemptedSave = useRef(false)

  useEffect(() => {
    if (isSuccess && hash && poolAddress && !isSavingToDB && !hasAttemptedSave.current) {
      hasAttemptedSave.current = true
      setIsSavingToDB(true)
      savePoolToDB()
    }
  }, [isSuccess, hash, poolAddress, isSavingToDB])

  const savePoolToDB = async () => {
    try {
      if (!address) throw new Error("No wallet address")
      if (!poolAddress) throw new Error("Pool address not available")

      const response = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          poolType: "target",
          creatorAddress: address,
          poolAddress: poolAddress,
          tokenAddress: TOKEN_ADDRESS,
          members: validMembers,
          targetAmount: formData.targetAmount,
          deadline: formData.deadline,
          txHash: hash,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save pool")
      }

      const pool = await response.json()
      setIsSavingToDB(false)

      setTimeout(() => {
        router.push(`/dashboard/group/${pool.id}`)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pool")
      setIsSavingToDB(false)
    }
  }

  const contributionPerMember =
    validMembers.length > 0
      ? (Number.parseFloat(formData.targetAmount || "0") / validMembers.length).toFixed(4)
      : "0"

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
          placeholder="e.g., Wedding Fund"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe the savings goal"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, targetAmount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Target Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, deadline: e.target.value })}
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
          {members.map((member: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="0x..."
                value={member}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMember(index, e.target.value)}
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
            <li>Target Amount: {formData.targetAmount || "0"} ETH</li>
            <li>Contribution per Member: {contributionPerMember} ETH</li>
            <li>Deadline: {formData.deadline || "Not set"}</li>
          </ul>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || isSavingToDB}>
          {isLoading || isSavingToDB ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSavingToDB ? "Saving to database..." : "Creating Group..."}
            </>
          ) : (
            "Create Target Pool"
          )}
        </Button>
        {hash && <p className="text-xs text-green-600 mt-2">TX: {hash.slice(0, 20)}...</p>}
      </div>
    </form>
  )
}
