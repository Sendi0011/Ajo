"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Calendar, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

interface Pool {
  id: string;
  name: string;
  type: "rotational" | "target" | "flexible";
  status: "active" | "completed" | "paused";
  members_count: number;
  total_saved: number;
  progress: number;
  frequency?: string;
  next_payout?: string;
}

interface MyGroupsProps {
  onCreateClick?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function MyGroups({ onCreateClick }: MyGroupsProps) {
  const { address } = useAccount();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    fetchPools();
  }, [address]);

  const fetchPools = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/pools?creator=${address?.toLowerCase()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pools");
      }

      const data = await response.json();
      setPools(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pools");
      setPools([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPoolType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatEth = (amount: number | null) => {
    if (!amount) return "0 ETH";
    return `${amount.toFixed(2)} ETH`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Groups</h2>
            <p className="text-muted-foreground mt-1">
              Manage your savings circles
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Groups</h2>
            <p className="text-muted-foreground mt-1">
              Manage your savings circles
            </p>
          </div>
        </div>
        <Card className="p-6 bg-destructive/10 text-destructive">
          <p>{error}</p>
        </Card>
      </div>
    );
  }

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
          <p className="text-muted-foreground mt-1">
            {pools.length === 0
              ? "Manage your savings circles"
              : `${pools.length} active group${pools.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </motion.div>

      {pools.length === 0 ? (
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
                Create your first savings group or join an existing one to get
                started
              </p>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={onCreateClick}
              >
                Create Your First Group
              </Button>
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
          {pools.map((pool) => (
            <motion.div key={pool.id} variants={item}>
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{pool.name}</h3>
                    <Badge variant="secondary">
                      {formatPoolType(pool.type)}
                    </Badge>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {pool.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Members
                    </span>
                    <span className="font-medium">{pool.members_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Total Saved
                    </span>
                    <span className="font-medium">
                      {formatEth(pool.total_saved)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {pool.type === "rotational" ? "Frequency" : "Status"}
                    </span>
                    <span className="font-medium">
                      {pool.frequency || pool.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{pool.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pool.progress || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  asChild
                >
                  <Link href={`/dashboard/group/${pool.id}`}>
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
  );
}
