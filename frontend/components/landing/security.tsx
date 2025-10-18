"use client"

import { Card } from "@/components/ui/card"
import { Shield, Lock, Eye, FileCheck } from "lucide-react"
import { motion } from "framer-motion"

const securityFeatures = [
  {
    icon: Shield,
    title: "Smart Contract Security",
    description: "All funds are held in audited smart contracts on Base blockchain.",
  },
  {
    icon: Lock,
    title: "Non-Custodial",
    description: "You maintain full control of your funds. We never hold your assets.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Every transaction is recorded on-chain and publicly verifiable.",
  },
  {
    icon: FileCheck,
    title: "Reputation System",
    description: "Build your on-chain savings history for future opportunities.",
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
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
}

export function Security() {
  return (
    <section id="security" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Built with <span className="text-primary">security</span> in mind
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Your funds are protected by blockchain technology and smart contracts
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {securityFeatures.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="p-6 h-full text-center hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
