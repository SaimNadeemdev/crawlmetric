"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { updateApiKeys, getApiKeys } from "@/lib/api"
import DashboardLayout from "@/app/dashboard-layout"

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [apiLogin, setApiLogin] = useState("")
  const [apiPassword, setApiPassword] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const loadApiKeys = async () => {
      if (user) {
        try {
          setIsLoading(true)
          const keys = await getApiKeys()
          setApiLogin(keys.login || "")
          setApiPassword(keys.password || "")
        } catch (error) {
          toast({
            title: "Error loading API keys",
            description: "There was an error loading your API keys. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadApiKeys()
  }, [user, toast])

  const handleSaveApiKeys = async () => {
    setIsSaving(true)
    try {
      await updateApiKeys(apiLogin, apiPassword)
      toast({
        title: "API keys saved",
        description: "Your DataForSEO API keys have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving API keys",
        description: "There was an error saving your API keys. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Tabs defaultValue="api-keys">
          <TabsList>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>DataForSEO API Keys</CardTitle>
                <CardDescription>
                  These are the common DataForSEO API credentials used by all users in the system. Your usage is tracked
                  individually and you will be billed based on your specific usage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="api-login">API Login</Label>
                      <Input id="api-login" value={apiLogin} readOnly className="bg-muted" />
                      <p className="text-sm text-muted-foreground">This is a shared API login for all users</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-password">API Password</Label>
                      <Input id="api-password" type="password" value={apiPassword} readOnly className="bg-muted" />
                      <p className="text-sm text-muted-foreground">This is a shared API password for all users</p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2">
                <p className="text-sm">
                  These credentials are managed by the system administrator. Your usage is tracked and billed
                  separately.
                </p>
                <p className="text-sm font-medium">
                  Contact support if you have any questions about API usage or billing.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account details and password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={user?.name || ""} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} placeholder="Your email" disabled />
                  <p className="text-sm text-muted-foreground">Email address cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="New password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Update Account</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your keyword tracking experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-location">Default Location</Label>
                  <Input id="default-location" defaultValue="United States" placeholder="Default search location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Input id="default-language" defaultValue="English" placeholder="Default search language" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-device">Default Device</Label>
                  <Input id="default-device" defaultValue="Desktop" placeholder="Default device type" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

