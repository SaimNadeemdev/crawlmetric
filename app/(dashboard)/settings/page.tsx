"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // No need for auth check here as it's handled by the (dashboard) layout

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="text-[#0071e3]">
            Settings
          </span>
        </h1>
        <p className="text-gray-500 text-lg">Manage your account and preferences</p>
      </div>

      <div className="flex justify-center mb-8">
        <Tabs defaultValue="account" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full p-1 w-full max-w-md">
              <TabsTrigger 
                value="account" 
                className="rounded-full data-[state=active]:bg-[#0071e3] data-[state=active]:text-white"
              >
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="rounded-full data-[state=active]:bg-[#0071e3] data-[state=active]:text-white"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="rounded-full data-[state=active]:bg-[#0071e3] data-[state=active]:text-white"
              >
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-[22px] p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Your name" 
                      defaultValue={user?.email?.split('@')[0] || ""}
                      className="border-gray-200 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email" 
                      defaultValue={user?.email || ""}
                      disabled
                      className="border-gray-200 bg-gray-50 rounded-xl"
                    />
                  </div>
                  <Button 
                    className="bg-[#0071e3] hover:bg-blue-700 text-white rounded-full mt-2"
                    onClick={() => toast({
                      title: "Profile updated",
                      description: "Your profile information has been updated successfully.",
                    })}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-[22px] p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold">Password</h2>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="u2022u2022u2022u2022u2022u2022u2022u2022" 
                      className="border-gray-200 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="u2022u2022u2022u2022u2022u2022u2022u2022" 
                      className="border-gray-200 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="u2022u2022u2022u2022u2022u2022u2022u2022" 
                      className="border-gray-200 rounded-xl"
                    />
                  </div>
                  <Button 
                    className="bg-[#0071e3] hover:bg-blue-700 text-white rounded-full mt-2"
                    onClick={() => toast({
                      title: "Password updated",
                      description: "Your password has been updated successfully.",
                    })}
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-[22px] p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold">Theme</h2>
                <p className="text-gray-500">Customize the appearance of the application</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Button variant="outline" className="border-2 border-[#0071e3] h-auto aspect-video flex flex-col p-4 rounded-xl">
                    <span className="text-[#0071e3] font-medium">Light</span>
                  </Button>
                  <Button variant="outline" className="border border-gray-200 h-auto aspect-video flex flex-col p-4 rounded-xl">
                    <span className="text-gray-500 font-medium">Dark</span>
                  </Button>
                  <Button variant="outline" className="border border-gray-200 h-auto aspect-video flex flex-col p-4 rounded-xl">
                    <span className="text-gray-500 font-medium">System</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-[22px] p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold">Email Notifications</h2>
                <p className="text-gray-500">Configure when you'll receive email notifications</p>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ranking-changes" className="cursor-pointer">Ranking changes</Label>
                    <input 
                      id="ranking-changes" 
                      type="checkbox" 
                      defaultChecked 
                      className="toggle toggle-primary" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekly-reports" className="cursor-pointer">Weekly reports</Label>
                    <input 
                      id="weekly-reports" 
                      type="checkbox" 
                      defaultChecked 
                      className="toggle toggle-primary" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="news-updates" className="cursor-pointer">News and updates</Label>
                    <input 
                      id="news-updates" 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
