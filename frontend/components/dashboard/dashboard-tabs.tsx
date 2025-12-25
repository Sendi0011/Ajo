"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyGroups } from "@/components/dashboard/my-groups";
import { CreateGroup } from "@/components/dashboard/create-group";
import { Transactions } from "@/components/dashboard/transactions";
import { Profile } from "@/components/dashboard/profile";
import { Home, PlusCircle, Receipt, User } from "lucide-react";
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("groups");

  const handleCreateClick = useCallback(() => {
    setActiveTab("create");
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="groups" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">My Groups</span>
        </TabsTrigger>
        <TabsTrigger value="create" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Transactions</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
      </TabsList>

      <Link href="/dashboard/analytics">
        <Button variant="ghost" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
      </Link>
      
      <TabsContent value="groups" className="mt-0">
        <MyGroups onCreateClick={handleCreateClick} />
      </TabsContent>

      <TabsContent value="create" className="mt-0">
        <CreateGroup />
      </TabsContent>

      <TabsContent value="transactions" className="mt-0">
        <Transactions />
      </TabsContent>

      <TabsContent value="profile" className="mt-0">
        <Profile />
      </TabsContent>

    </Tabs>
  );
}
