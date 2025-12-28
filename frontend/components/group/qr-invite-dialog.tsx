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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Generate Invite Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members to {poolName}</DialogTitle>
          <DialogDescription>
            Generate a secure invite link or QR code to share with potential members
          </DialogDescription>
        </DialogHeader>

        {!inviteData ? (
          <div className="space-y-4 py-4">
            {/* Expiration Setting */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="expiration" className="text-sm font-medium">
                  Set Expiration
                </Label>
              </div>
              <Switch
                id="expiration"
                checked={hasExpiration}
                onCheckedChange={setHasExpiration}
              />
            </div>

            {hasExpiration && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="days" className="text-xs">Expires in (days)</Label>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  max={90}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 7)}
                />
              </div>
            )}

            {/* Max Uses Setting */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="limit-uses" className="text-sm font-medium">
                  Limit Uses
                </Label>
              </div>
              <Switch
                id="limit-uses"
                checked={limitUses}
                onCheckedChange={setLimitUses}
              />
            </div>

            {limitUses && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="max-uses" className="text-xs">Maximum uses</Label>
                <Input
                  id="max-uses"
                  type="number"
                  min={1}
                  max={100}
                  value={maxUses || ""}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || undefined)}
                  placeholder="Unlimited"
                />
              </div>
            )}

            <Button
              onClick={generateInvite}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? "Generating..." : "Generate Invite Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* QR Code Display */}
            <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteData.invite_url)}`}
                alt="Invite QR Code"
                className="w-48 h-48"
              />
            </div>

            {/* Invite Link */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteData.invite_url}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Invite Code */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Invite Code</p>
                <p className="font-mono font-bold text-lg">{inviteData.invite_code}</p>
              </div>
              <Badge variant="secondary">
                {inviteData.uses_count} uses
              </Badge>
            </div>

            {/* Invite Details */}
            <div className="space-y-2 text-sm">
              {inviteData.max_uses && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max Uses:</span>
                  <span className="font-medium">{inviteData.max_uses}</span>
                </div>
              )}
              {inviteData.expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-medium">
                    {new Date(inviteData.expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}