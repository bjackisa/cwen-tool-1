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
    <div className="flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CWEN WGCT Analytics</h1>
              <p className="text-sm text-gray-600">Community Women's Enterprise Network</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {profile?.full_name || userEmail}</span>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm">Sign Out</Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <DataImportPage embedded />
      </main>
    </div>
  )
}

