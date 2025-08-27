import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BarChart3, Users, FileText, TrendingUp, Database, UserPlus } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CWEN WGCT Analytics</h1>
              <p className="text-sm text-gray-600">Community Women's Enterprise Network</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {profile?.full_name || data.user.email}</span>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage and analyze survey data for coffee and tea value chain participants</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/data-import">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Database className="h-6 w-6 text-blue-600" />
                <CardTitle className="ml-2 text-lg">Import Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Import survey data from Excel files or manual entry</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <CardTitle className="ml-2 text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>View comprehensive analytics and insights from survey data</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/followup">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <UserPlus className="h-6 w-6 text-purple-600" />
                <CardTitle className="ml-2 text-lg">Follow-up Surveys</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Conduct follow-up visits and track progress over time</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/respondents">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Users className="h-6 w-6 text-orange-600" />
                <CardTitle className="ml-2 text-lg">Respondents</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>View and manage all survey respondents and their data</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <FileText className="h-6 w-6 text-red-600" />
                <CardTitle className="ml-2 text-lg">Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Generate and export detailed reports and summaries</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/comparison">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
                <CardTitle className="ml-2 text-lg">Data Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Compare initial surveys with follow-up data</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and system activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Welcome to the CWEN WGCT Analytics Platform. Start by importing your survey data or exploring the
              analytics dashboard.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
