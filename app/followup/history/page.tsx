"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Calendar, User, Eye } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/ui/pagination"

interface FollowupSurvey {
  id: string
  visit_date: string
  progress_since_last_visit: string
  business_growth_status: string
  revenue_change: string
  recommendations: string
  conducted_by: string
  original_respondent: {
    respondent_name: string
    district: string
    group_name: string
  }
  conductor: {
    full_name: string
  }
}

export default function FollowupHistoryPage() {
  const [followups, setFollowups] = useState<FollowupSurvey[]>([])
  const [filteredFollowups, setFilteredFollowups] = useState<FollowupSurvey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchFollowups()
  }, [])

  useEffect(() => {
    filterData()
  }, [followups, searchTerm])

  const fetchFollowups = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("followup_surveys")
        .select(`
          id, visit_date, progress_since_last_visit, business_growth_status,
          revenue_change, recommendations, conducted_by,
          original_respondent:survey_respondents(respondent_name, district, group_name),
          conductor:profiles(full_name)
        `)
        .order("visit_date", { ascending: false })

      if (error) throw error
      setFollowups(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const filterData = () => {
    let filtered = followups

    if (searchTerm) {
      filtered = filtered.filter(
        (followup) =>
          followup.original_respondent?.respondent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          followup.original_respondent?.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          followup.original_respondent?.group_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredFollowups(filtered)
    setPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading follow-up history...</p>
        </div>
      </div>
    )
  }

  const itemsPerPage = 15
  const pageCount = Math.ceil(filteredFollowups.length / itemsPerPage)
  const paginatedFollowups = filteredFollowups.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/followup" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Follow-up
              </Link>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">Follow-up History</h1>
                <p className="text-sm text-gray-600">View all completed follow-up surveys</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search Follow-up Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by respondent name, district, or group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {paginatedFollowups.length} of {filteredFollowups.length} follow-up surveys
            </div>
          </CardContent>
        </Card>

        {/* Follow-ups Table */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Survey History</CardTitle>
            <CardDescription>All completed follow-up surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Business Growth</TableHead>
                    <TableHead>Revenue Change</TableHead>
                    <TableHead>Conducted By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFollowups.map((followup) => (
                    <TableRow key={followup.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{followup.original_respondent?.respondent_name || "N/A"}</div>
                            <div className="text-sm text-gray-500">
                              {followup.original_respondent?.group_name || "No group"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{followup.original_respondent?.district || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{new Date(followup.visit_date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            followup.business_growth_status === "Expanded"
                              ? "default"
                              : followup.business_growth_status === "Declined"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {followup.business_growth_status || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            followup.revenue_change === "Increased"
                              ? "default"
                              : followup.revenue_change === "Decreased"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {followup.revenue_change || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{followup.conductor?.full_name || "Unknown"}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredFollowups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No follow-up surveys match your search." : "No follow-up surveys found."}
              </div>
            )}
            {pageCount > 1 && (
              <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
