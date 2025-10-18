"use client"

import { use } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RotationalForm } from "@/components/create-group/rotational-form"
import { TargetForm } from "@/components/create-group/target-form"
import { FlexibleForm } from "@/components/create-group/flexible-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

const validTypes = ["rotational", "target", "flexible"]

export default function CreateGroupPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params)

  if (!validTypes.includes(type)) {
    redirect("/dashboard")
  }

  const titles = {
    rotational: "Create Rotational Savings Group",
    target: "Create Target Pool Group",
    flexible: "Create Flexible Pool Group",
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">{titles[type as keyof typeof titles]}</h1>
            <p className="text-muted-foreground mb-8">Fill in the details to create your savings group</p>

            {type === "rotational" && <RotationalForm />}
            {type === "target" && <TargetForm />}
            {type === "flexible" && <FlexibleForm />}
          </Card>
        </div>
      </main>
    </div>
  )
}
