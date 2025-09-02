"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, BarChart3, Users } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RespondentWithFollowup {
  id: string
  respondent_name: string
  district: string
  sub_county: string
  parish: string
  age: string
  gender: string
  occupation: string
  industry_involvement: string
  value_chain_role: string
  has_business_training: boolean
  is_business_registered: boolean
  has_financial_access: boolean
  uses_technology: boolean
  created_at: string
  followups: {
    id: string
    visit_date: string
    current_age: string
    current_occupation: string
    business_growth_status: string
    revenue_change: string
    current_business_training: boolean
    current_business_registration: boolean
    current_financial_access: boolean
    technology_adoption_progress: string
  }[]
}

interface ComparisonMetrics {
  totalRespondents: number
  respondentsWithFollowups: number
  businessGrowthTrends: { name: string; original: number; followup: number }[]
  technologyAdoptionTrends: { name: string; original: number; followup: number }[]
  trainingProgressTrends: { name: string; original: number; followup: number }[]
}

export default function ComparisonPage() {
  const [respondents, setRespondents] = useState<RespondentWithFollowup[]>([])
  const [filteredRespondents, setFilteredRespondents] = useState<RespondentWithFollowup[]>([])
  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"individual" | "aggregate">("individual")
  const [districts, setDistricts] = useState<string[]>([])

  useEffect(() => {
    fetchComparisonData()
  }, [])

  useEffect(() => {
    filterData()
  }, [respondents, searchTerm, selectedDistrict])

  const fetchComparisonData = async () => {
    try {
      const supabase = createClient()

      // Get respondents with their follow-ups and district list
      const [resp, dist] = await Promise.all([
        supabase
          .from("survey_respondents")
          .select(`
            id, respondent_name, district, sub_county, parish, age, gender,
            occupation, industry_involvement, value_chain_role, has_business_training,
            is_business_registered, has_financial_access, uses_technology, created_at,
            followup_surveys:followup_surveys(
              id, visit_date, current_age, current_occupation, business_growth_status,
              revenue_change, current_business_training, current_business_registration,
              current_financial_access, technology_adoption_progress
            )
          `)
          .order("created_at", { ascending: false }),
        supabase.from("districts").select("name").order("name"),
      ])

      if (resp.error) throw resp.error

      const processedData = (resp.data || []).map((respondent) => ({
        ...respondent,
        followups: respondent.followup_surveys || [],
      }))

      setRespondents(processedData)
      setDistricts((dist.data || []).map((d) => d.name))

      // Calculate comparison metrics
      const comparisonMetrics = calculateComparisonMetrics(processedData)
      setMetrics(comparisonMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateComparisonMetrics = (data: RespondentWithFollowup[]): ComparisonMetrics => {
    const totalRespondents = data.length
    const respondentsWithFollowups = data.filter((r) => r.followups.length > 0).length

    // Business growth trends
    const businessGrowthData = data.filter((r) => r.followups.length > 0)
    const growthCounts = businessGrowthData.reduce(
      (acc, r) => {
        const latestFollowup = r.followups[r.followups.length - 1]
        const status = latestFollowup.business_growth_status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const businessGrowthTrends = Object.entries(growthCounts).map(([name, followup]) => ({
      name,
      original: 0, // Original surveys don't have growth status
      followup,
    }))

    // Technology adoption comparison
    const originalTechUsers = data.filter((r) => r.uses_technology).length
    const followupTechUsers = businessGrowthData.filter((r) =>
      r.followups.some(
        (f) => f.technology_adoption_progress && f.technology_adoption_progress.toLowerCase().includes("progress"),
      ),
    ).length

    const technologyAdoptionTrends = [
      { name: "Technology Users", original: originalTechUsers, followup: followupTechUsers },
    ]

    // Training progress comparison
    const originalTraining = data.filter((r) => r.has_business_training).length
    const followupTraining = businessGrowthData.filter((r) =>
      r.followups.some((f) => f.current_business_training),
    ).length

    const trainingProgressTrends = [
      { name: "Business Training", original: originalTraining, followup: followupTraining },
    ]

    return {
      totalRespondents,
      respondentsWithFollowups,
      businessGrowthTrends,
      technologyAdoptionTrends,
      trainingProgressTrends,
    }
  }

  const filterData = () => {
    let filtered = respondents

    if (searchTerm) {
      filtered = filtered.filter(
        (respondent) =>
          respondent.respondent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          respondent.district?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedDistrict !== "all") {
      filtered = filtered.filter((respondent) => respondent.district === selectedDistrict)
    }

    setFilteredRespondents(filtered)
  }

  const getChangeIndicator = (original: boolean | string, current: boolean | string) => {
    if (typeof original === "boolean" && typeof current === "boolean") {
      if (original === current) return <Minus className="h-4 w-4 text-gray-400" />
      if (current && !original) return <TrendingUp className="h-4 w-4 text-green-600" />
      if (!current && original) return <TrendingDown className="h-4 w-4 text-red-600" />
    }

    if (original !== current) {
      return <TrendingUp className="h-4 w-4 text-blue-600" />
    }

    return <Minus className="h-4 w-4 text-gray-400" />
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comparison data...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Data Comparison</h1>
                <p className="text-sm text-gray-600">Compare initial surveys with follow-up data</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={viewMode} onValueChange={(value: "individual" | "aggregate") => setViewMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual View</SelectItem>
                  <SelectItem value="aggregate">Aggregate View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Respondents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalRespondents || 0}</div>
              <p className="text-xs text-muted-foreground">Original surveys</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Follow-ups</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.respondentsWithFollowups || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.totalRespondents
                  ? Math.round(((metrics.respondentsWithFollowups || 0) / metrics.totalRespondents) * 100)
                  : 0}
                % coverage
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.businessGrowthTrends.find((t) => t.name === "Expanded")?.followup || 0}
              </div>
              <p className="text-xs text-muted-foreground">Businesses expanded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tech Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.technologyAdoptionTrends[0]?.followup || 0}</div>
              <p className="text-xs text-muted-foreground">Technology adopters</p>
            </CardContent>
          </Card>
        </div>

        {viewMode === "aggregate" ? (
          /* Aggregate View */
          <div className="space-y-8">
            {/* Business Growth Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Business Growth Trends</CardTitle>
                <CardDescription>Comparison of business growth status in follow-up surveys</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics?.businessGrowthTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="followup" fill="#3B82F6" name="Follow-up Data" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Technology and Training Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technology Adoption</CardTitle>
                  <CardDescription>Original vs Follow-up technology usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={metrics?.technologyAdoptionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="original" fill="#94A3B8" name="Original" />
                      <Bar dataKey="followup" fill="#10B981" name="Follow-up" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Training</CardTitle>
                  <CardDescription>Training access comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={metrics?.trainingProgressTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="original" fill="#94A3B8" name="Original" />
                      <Bar dataKey="followup" fill="#F59E0B" name="Follow-up" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Individual View */
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name or district..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredRespondents.length} of {respondents.length} respondents
                </div>
              </CardContent>
            </Card>

            {/* Individual Comparisons */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Progress Comparison</CardTitle>
                <CardDescription>
                  Compare original survey data with follow-up progress for each respondent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Respondent</TableHead>
                        <TableHead>Follow-ups</TableHead>
                        <TableHead>Business Training</TableHead>
                        <TableHead>Business Registration</TableHead>
                        <TableHead>Financial Access</TableHead>
                        <TableHead>Business Growth</TableHead>
                        <TableHead>Revenue Change</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRespondents.map((respondent) => {
                        const latestFollowup = respondent.followups[respondent.followups.length - 1]

                        return (
                          <TableRow key={respondent.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{respondent.respondent_name || "N/A"}</div>
                                <div className="text-sm text-gray-500">{respondent.district}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={respondent.followups.length > 0 ? "default" : "secondary"}>
                                {respondent.followups.length} follow-ups
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                  {respondent.has_business_training ? "Yes" : "No"} →{" "}
                                  {latestFollowup?.current_business_training ? "Yes" : "No"}
                                </span>
                                {getChangeIndicator(
                                  respondent.has_business_training,
                                  latestFollowup?.current_business_training || false,
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                  {respondent.is_business_registered ? "Yes" : "No"} →{" "}
                                  {latestFollowup?.current_business_registration ? "Yes" : "No"}
                                </span>
                                {getChangeIndicator(
                                  respondent.is_business_registered,
                                  latestFollowup?.current_business_registration || false,
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                  {respondent.has_financial_access ? "Yes" : "No"} →{" "}
                                  {latestFollowup?.current_financial_access ? "Yes" : "No"}
                                </span>
                                {getChangeIndicator(
                                  respondent.has_financial_access,
                                  latestFollowup?.current_financial_access || false,
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {latestFollowup?.business_growth_status ? (
                                <Badge
                                  variant={
                                    latestFollowup.business_growth_status === "Expanded"
                                      ? "default"
                                      : latestFollowup.business_growth_status === "Declined"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {latestFollowup.business_growth_status}
                                </Badge>
                              ) : (
                                <span className="text-sm text-gray-500">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {latestFollowup?.revenue_change ? (
                                <Badge
                                  variant={
                                    latestFollowup.revenue_change === "Increased"
                                      ? "default"
                                      : latestFollowup.revenue_change === "Decreased"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {latestFollowup.revenue_change}
                                </Badge>
                              ) : (
                                <span className="text-sm text-gray-500">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Link href={`/comparison/details/${respondent.id}`}>
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                {filteredRespondents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || selectedDistrict !== "all"
                      ? "No respondents match your filters."
                      : "No respondents found."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
