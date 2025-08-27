"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Users, FileText, TrendingUp, UserPlus } from "lucide-react"
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
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r p-6 space-y-4">
        <h2 className="text-xl font-bold">Menu</h2>
        <nav className="space-y-2">
          <Link href="/analytics" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <BarChart3 className="h-4 w-4" /> <span>Analytics</span>
          </Link>
          <Link href="/followup" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <UserPlus className="h-4 w-4" /> <span>Follow-up</span>
          </Link>
          <Link href="/respondents" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <Users className="h-4 w-4" /> <span>Respondents</span>
          </Link>
          <Link href="/reports" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <FileText className="h-4 w-4" /> <span>Reports</span>
          </Link>
          <Link href="/comparison" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <TrendingUp className="h-4 w-4" /> <span>Comparison</span>
          </Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    </div>
  )
}

