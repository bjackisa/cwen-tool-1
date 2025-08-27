"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import DataImportPage from "../data-import/page"

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUserEmail(user.email || "")
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profile)
    }
    loadProfile()
  }, [router])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CWEN WGCT Analytics</h1>
          <p className="text-sm text-muted-foreground">Community Women's Enterprise Network</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">Welcome, {profile?.full_name || userEmail}</span>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm">Sign Out</Button>
          </form>
        </div>
      </div>
      <DataImportPage embedded />
    </div>
  )
}

