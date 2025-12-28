"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { QrCode, Copy, Share2, Check, Calendar, Users, Link2 } from "lucide-react"
import { toast } from "sonner"
import { useAccount } from "wagmi"

interface QRInviteDialogProps {
  poolId: string
  poolName: string
}

export function QRInviteDialog({ poolId, poolName }: QRInviteDialogProps) {
  const { address } = useAccount()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inviteData, setInviteData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  // Invite settings
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined)
  const [hasExpiration, setHasExpiration] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState(7)
  const [limitUses, setLimitUses] = useState(false)

  const generateInvite = async () => {
    if (!address) {
      toast.error("Please connect your wallet")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool_id: poolId,
          inviter_address: address,
          max_uses: limitUses ? maxUses : null,
          expires_in_days: hasExpiration ? expiresInDays : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setInviteData(data)
        toast.success("Invite link generated!")
      } else {
        toast.error("Failed to generate invite")
      }
    } catch (error) {
      console.error("Failed to generate invite:", error)
      toast.error("Failed to generate invite")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!inviteData?.invite_url) return

    try {
      await navigator.clipboard.writeText(inviteData.invite_url)
      setCopied(true)
      toast.success("Invite link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const shareInvite = async () => {
    if (!inviteData?.invite_url) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${poolName}`,
          text: `You're invited to join "${poolName}" savings group!`,
          url: inviteData.invite_url,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyToClipboard()
    }
  }

  const downloadQR = () => {
    if (!inviteData?.invite_url) return

    // Create QR code using an external service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteData.invite_url)}`
    
    const link = document.createElement("a")
    link.href = qrUrl
    link.download = `invite-${poolName.replace(/\s/g, "-")}.png`
    link.click()
    
    toast.success("QR code downloaded!")
  }

  
}