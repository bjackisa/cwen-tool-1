"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Plus, Calendar, User, MapPin } from "lucide-react"
import Link from "next/link"

interface Respondent {
  id: string
  respondent_name: string
  district: string
  sub_county: string
  parish: string
  age: string
  gender: string
  industry_involvement: string
  value_chain_role: string
  group_name: string
  created_at: string
  followup_count?: number
  last_followup?: string
}

export default function FollowupPage() {
  const [respondents, setRespondents] = useState<Respondent[]>([])
  const [filteredRespondents, setFilteredRespondents] = useState<Respondent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRespondents()
  }, [])

  useEffect(() => {
    filterData()
  }, [respondents, searchTerm])

  const fetchRespondents = async () => {
    try {
      const supabase = createClient()

      // Get respondents with follow-up count
      const { data: respondentsData, error: respondentsError } = await supabase
        .from("survey_respondents")
        .select(`
          id, respondent_name, district, sub_county, parish, age, gender,
          industry_involvement, value_chain_role, group_name, created_at
        `)
        .order("created_at", { ascending: false })

      if (respondentsError) throw respondentsError

      // Get follow-up counts for each respondent
      const { data: followupData, error: followupError } = await supabase
        .from("followup_surveys")
        .select("original_respondent_id, visit_date")
        .order("visit_date", { ascending: false })

      if (followupError) throw followupError

      // Combine data
      const respondentsWithFollowup = (respondentsData || []).map((respondent) => {
        const followups = (followupData || []).filter((f) => f.original_respondent_id === respondent.id)
        return {
          ...respondent,
          followup_count: followups.length,
          last_followup: followups.length > 0 ? followups[0].visit_date : null,
        }
      })

      setRespondents(respondentsWithFollowup)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const filterData = () => {
    let filtered = respondents

    if (searchTerm) {
      filtered = filtered.filter(
        (respondent) =>
          respondent.respondent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          respondent.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          respondent.district?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRespondents(filtered)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading respondents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">Follow-up Surveys</h1>
                <p className="text-sm text-gray-600">Conduct follow-up visits and track progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/followup/history">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Select Respondent for Follow-up</CardTitle>
            <CardDescription>Choose a respondent to conduct a follow-up survey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, group, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredRespondents.length} of {respondents.length} respondents
            </div>
          </CardContent>
        </Card>

        {/* Respondents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Respondents</CardTitle>
            <CardDescription>Select a respondent to start a follow-up survey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Original Survey</TableHead>
                    <TableHead>Follow-ups</TableHead>
                    <TableHead>Last Follow-up</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRespondents.map((respondent) => (
                    <TableRow key={respondent.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{respondent.respondent_name || "N/A"}</div>
                            <div className="text-sm text-gray-500">
                              {respondent.gender}, {respondent.age}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div className="text-sm">
                            <div>{respondent.district}</div>
                            <div className="text-gray-500">{respondent.sub_county}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="secondary">{respondent.industry_involvement}</Badge>
                          <div className="text-xs text-gray-500">{respondent.value_chain_role}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{respondent.group_name || "N/A"}</TableCell>
                      <TableCell className="text-sm">{new Date(respondent.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={respondent.followup_count === 0 ? "destructive" : "default"}>
                          {respondent.followup_count} follow-ups
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {respondent.last_followup ? new Date(respondent.last_followup).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <Link href={`/followup/new/${respondent.id}`}>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Follow-up
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRespondents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No respondents match your search." : "No respondents found."}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
