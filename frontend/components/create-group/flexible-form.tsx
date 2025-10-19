"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { useCreateFlexible } from "@/hooks/useBaseSafeContracts"

export function FlexibleForm() {
  const router = useRouter()
  const { address } = useAccount()
  const [members, setMembers] = useState<string[]>([""])
  const [error, setError] = useState("")
  const [isSavingToDB, setIsSavingToDB] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    minimumDeposit: "",
    enableYield: false,
    withdrawalFee: "1",
  })

  const validMembers = members.filter((m) => m && m.startsWith("0x") && m.length === 42)

  const { create, isLoading, isSuccess, hash } = useCreateFlexible(
    validMembers,
    formData.minimumDeposit,
    formData.withdrawalFee,
    formData.enableYield,
    100
  )

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

    if (!formData.minimumDeposit) {
      setError("Please enter minimum deposit")
      return
    }

    if (create) {
      create()
    }
  }

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
          poolType: "flexible",
          creatorAddress: address,
          contractAddress: "0x" + Math.random().toString(16).slice(2),
          tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
          members: validMembers,
          minimumDeposit: formData.minimumDeposit,
          withdrawalFee: formData.withdrawalFee,
          yieldEnabled: formData.enableYield,
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
          placeholder="e.g., Emergency Fund"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose of this flexible pool"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minimum">Minimum Deposit (ETH)</Label>
          <Input
            id="minimum"
            type="number"
            step="0.01"
            placeholder="0.1"
            value={formData.minimumDeposit}
            onChange={(e) => setFormData({ ...formData, minimumDeposit: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fee">Withdrawal Fee (%)</Label>
          <Input
            id="fee"
            type="number"
            step="0.1"
            placeholder="1"
            value={formData.withdrawalFee}
            onChange={(e) => setFormData({ ...formData, withdrawalFee: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border border-border">
        <div className="space-y-0.5">
          <Label htmlFor="yield">Enable Yield Generation</Label>
          <p className="text-sm text-muted-foreground">Stake idle funds in Base DeFi protocols for passive income</p>
        </div>
        <input
          id="yield"
          type="checkbox"
          checked={formData.enableYield}
          onChange={(e) => setFormData({ ...formData, enableYield: e.target.checked })}
          className="h-4 w-4 rounded"
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
            <li>Minimum Deposit: {formData.minimumDeposit || "0"} ETH</li>
            <li>Withdrawal Fee: {formData.withdrawalFee}%</li>
            <li>Yield Generation: {formData.enableYield ? "Enabled" : "Disabled"}</li>
          </ul>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || isSavingToDB}>
          {isLoading || isSavingToDB ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSavingToDB ? "Saving to database..." : "Creating Group..."}
            </>
          ) : (
            "Create Flexible Pool"
          )}
        </Button>
        {hash && <p className="text-xs text-green-600 mt-2">TX: {hash.slice(0, 20)}...</p>}
      </div>
    </form>
  )
}
