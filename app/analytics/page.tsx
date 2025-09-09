"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { normalize, toTitleCase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Download,
  Filter,
  Users,
  MapPin,
  Briefcase,
  TrendingUp,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sankey } from "recharts"

interface AnalyticsData {
  totalRespondents: number
  coffeeFarmers: number
  teaFarmers: number
  demographics: {
    gender: { name: string; value: number }[]
    education: { name: string; value: number }[]
    ageGroups: { name: string; value: number }[]
    maritalStatus: { name: string; value: number }[]
  }
  business: {
    occupation: { name: string; value: number }[]
    industry: { name: string; value: number }[]
    industrySummary: { name: string; value: number }[]
    valueChainStage: { name: string; value: number }[]
    processingTeaStats: { count: number; percentage: number }
    challenges: { name: string; value: number }[]
    challengeSankey: {
      nodes: { name: string }[]
      links: { source: number; target: number; value: number }[]
    }
  }
  geography: {
    districts: { name: string; value: number }[]
    subCounties: { name: string; value: number }[]
  }
  technology: {
    adoption: { name: string; value: number }[]
    barriers: { name: string; value: number }[]
  }
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [selectedGender, setSelectedGender] = useState<string>("all")
  const [districts, setDistricts] = useState<string[]>([])
  const [sankeyZoom, setSankeyZoom] = useState(1)

  const sankeyHeight = Math.max(
    (data?.business.challengeSankey.nodes.length ?? 0) * 40,
    400,
  )

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedDistrict, selectedGender])

  useEffect(() => {
    const loadDistricts = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("districts").select("name").order("name")
      const names = Array.from(new Set((data || []).map((d) => toTitleCase(d.name)))).sort()
      setDistricts(names)
    }
    loadDistricts()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const supabase = createClient()

      // Build query with filters
      let query = supabase.from("survey_respondents").select("*")

      if (selectedDistrict !== "all") {
        query = query.ilike("district", normalize(selectedDistrict))
      }

      if (selectedGender !== "all") {
        query = query.ilike("gender", normalize(selectedGender))
      }

      const { data: respondents, error } = await query

      if (error) throw error

      // Process data for analytics
      const processedData = processAnalyticsData(respondents || [])
      setData(processedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const processAnalyticsData = (respondents: any[]): AnalyticsData => {
    const totalRespondents = respondents.length

    const coffeeFarmers = respondents.filter(
      (r) =>
        r.value_chain_role?.toLowerCase().includes("farmer") &&
        r.industry_involvement?.toLowerCase().includes("coffee"),
    ).length

    const teaFarmers = respondents.filter(
      (r) =>
        r.value_chain_role?.toLowerCase().includes("farmer") &&
        r.industry_involvement?.toLowerCase().includes("tea"),
    ).length

    // Demographics
    const genderCounts = respondents.reduce((acc, r) => {
      const gender = toTitleCase(r.gender || "Unknown")
      acc[gender] = (acc[gender] || 0) + 1
      return acc
    }, {})

    const educationCounts = respondents.reduce((acc, r) => {
      const education = toTitleCase(r.education_level || "Unknown")
      acc[education] = (acc[education] || 0) + 1
      return acc
    }, {})

    const ageGroups = respondents.reduce((acc, r) => {
      const age = Number.parseInt(r.age) || 0
      let group = "Unknown"
      if (age > 0) {
        if (age < 25) group = "18-24"
        else if (age < 35) group = "25-34"
        else if (age < 45) group = "35-44"
        else if (age < 55) group = "45-54"
        else group = "55+"
      }
      acc[group] = (acc[group] || 0) + 1
      return acc
    }, {})

    const maritalCounts = respondents.reduce((acc, r) => {
      const status = toTitleCase(r.marital_status || "Unknown")
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Business
    const occupationCounts = respondents.reduce((acc, r) => {
      const occupation = toTitleCase(r.occupation || "Unknown")
      acc[occupation] = (acc[occupation] || 0) + 1
      return acc
    }, {})

    // Industry involvement is case-insensitive. We separate overall coffee/tea
    // participation and detailed combinations for the donut chart.
    const industrySummaryCounts = { Coffee: 0, Tea: 0 }
    const industryDetailCounts: Record<string, number> = {}
    respondents.forEach((r) => {
      const raw = r.industry_involvement?.toString().trim() || ""
      if (!raw) {
        industryDetailCounts["Unknown"] = (industryDetailCounts["Unknown"] || 0) + 1
        return
      }
      const parts = raw.split(",").map((p: string) => p.trim()).filter(Boolean)
      const lower = parts.map((p) => p.toLowerCase())
      const hasCoffee = lower.includes("coffee")
      const hasTea = lower.includes("tea")
      if (hasCoffee) industrySummaryCounts.Coffee++
      if (hasTea) industrySummaryCounts.Tea++

      const others = parts.filter((_, idx) => !["coffee", "tea"].includes(lower[idx])).map(toTitleCase)
      const labelParts: string[] = []
      if (hasCoffee) labelParts.push("Coffee")
      if (hasTea) labelParts.push("Tea")
      if (others.length) labelParts.push(...others)
      const label = labelParts.length ? labelParts.join(" + ") : toTitleCase(raw)
      industryDetailCounts[label] = (industryDetailCounts[label] || 0) + 1
    })

    const valueChainStageCounts = respondents.reduce((acc, r) => {
      const stage = toTitleCase(r.value_chain_stage || "Unknown")
      acc[stage] = (acc[stage] || 0) + 1
      return acc
    }, {})

    const processingRespondents = respondents.filter(
      (r) => (r.value_chain_stage || "").toLowerCase() === "processing",
    )
    const totalProcessing = processingRespondents.length
    const teaProcessing = processingRespondents.filter((r) => {
      const raw = r.industry_involvement?.toString().toLowerCase() || ""
      return raw
        .split(",")
        .map((p: string) => p.trim())
        .includes("tea")
    }).length
    const processingTeaPercentage =
      totalProcessing > 0 ? (teaProcessing / totalProcessing) * 100 : 0

    // Challenges and group links
    const challengeCounts: Record<string, number> = {}
    const groupChallengeCounts: Record<string, Record<string, number>> = {}

    respondents.forEach((r) => {
      const group = toTitleCase(r.group_name || "")
      if (!group) return

      const allChallenges = [
        ...(r.business_challenges || []),
        ...(r.financial_challenges || []),
        ...(r.market_challenges || []),
      ]

      allChallenges.forEach((challenge: string) => {
        if (!challenge) return
        const name = toTitleCase(challenge)
        if (name === "Other") return

        challengeCounts[name] = (challengeCounts[name] || 0) + 1

        if (!groupChallengeCounts[group]) groupChallengeCounts[group] = {}
        groupChallengeCounts[group][name] =
          (groupChallengeCounts[group][name] || 0) + 1
      })
    })

    const groups = Object.keys(groupChallengeCounts)
    const challenges = Array.from(
      new Set(
        groups.flatMap((g) => Object.keys(groupChallengeCounts[g]))
      ),
    )

    const nodes = [
      ...groups.map((name) => ({ name })),
      ...challenges.map((name) => ({ name })),
    ]

    const links = groups.flatMap((g, gi) =>
      Object.entries(groupChallengeCounts[g]).map(([c, value]) => ({
        source: gi,
        target: groups.length + challenges.indexOf(c),
        value,
      })),
    )

    // Geography
    const districtCounts = respondents.reduce((acc, r) => {
      const district = toTitleCase(r.district || "Unknown")
      acc[district] = (acc[district] || 0) + 1
      return acc
    }, {})

    const subCountyCounts = respondents.reduce((acc, r) => {
      const subCounty = toTitleCase(r.sub_county || "Unknown")
      acc[subCounty] = (acc[subCounty] || 0) + 1
      return acc
    }, {})

    // Technology
    const technologyAdoption = respondents.reduce((acc, r) => {
      const uses = r.uses_technology ? "Uses Technology" : "No Technology"
      acc[uses] = (acc[uses] || 0) + 1
      return acc
    }, {})

    const technologyBarriers = respondents.reduce((acc, r) => {
      const barriers = r.technology_barriers || []
      barriers.forEach((barrier: string) => {
        const name = toTitleCase(barrier)
        acc[name] = (acc[name] || 0) + 1
      })
      return acc
    }, {})

    // Convert to chart format
    const toChartData = (obj: Record<string, number>) =>
      Object.entries(obj)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    const industrySummary = toChartData(industrySummaryCounts)
    const industry = toChartData(industryDetailCounts)

    return {
      totalRespondents,
      coffeeFarmers,
      teaFarmers,
      demographics: {
        gender: toChartData(genderCounts),
        education: toChartData(educationCounts),
        ageGroups: toChartData(ageGroups),
        maritalStatus: toChartData(maritalCounts),
      },
      business: {
        occupation: toChartData(occupationCounts),
        industry,
        industrySummary,
        valueChainStage: toChartData(valueChainStageCounts),
        processingTeaStats: { count: totalProcessing, percentage: processingTeaPercentage },
        challenges: toChartData(challengeCounts).slice(0, 10), // Top 10 challenges
        challengeSankey: {
          nodes,
          links,
        },
      },
      geography: {
        districts: toChartData(districtCounts),
        subCounties: toChartData(subCountyCounts).slice(0, 10), // Top 10 sub-counties
      },
      technology: {
        adoption: toChartData(technologyAdoption),
        barriers: toChartData(technologyBarriers).slice(0, 8), // Top 8 barriers
      },
    }
  }

  const exportAnalytics = () => {
    if (!data) return

    const csvContent = [
      ["Metric", "Category", "Value"],
      ["Total Respondents", "", data.totalRespondents.toString()],
      ["Coffee Farmers", "", data.coffeeFarmers.toString()],
      ["Tea Farmers", "", data.teaFarmers.toString()],
      ...data.demographics.gender.map((item) => ["Gender", item.name, item.value.toString()]),
      ...data.demographics.education.map((item) => ["Education", item.name, item.value.toString()]),
      ...data.business.occupation.map((item) => ["Occupation", item.name, item.value.toString()]),
      ...data.business.industrySummary.map((item) => ["Industry Summary", item.name, item.value.toString()]),
      ...data.business.industry.map((item) => ["Industry Detail", item.name, item.value.toString()]),
      ...data.geography.districts.map((item) => ["District", item.name, item.value.toString()]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "analytics_report.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const zoomIn = () => setSankeyZoom((z) => Math.min(z + 0.2, 2))
  const zoomOut = () => setSankeyZoom((z) => Math.max(z - 0.2, 0.5))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
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
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Comprehensive analysis of survey data</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={exportAnalytics} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map((d) => {
                      const count = data?.geography.districts.find((dist) => dist.name === d)?.value || 0
                      return (
                        <SelectItem key={d} value={d}>
                          {d} ({count})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    {data?.demographics.gender.map((gender) => (
                      <SelectItem key={gender.name} value={gender.name}>
                        {gender.name} ({gender.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Respondents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalRespondents || 0}</div>
              <p className="text-xs text-muted-foreground">Survey participants</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Districts Covered</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.geography.districts.length || 0}</div>
              <p className="text-xs text-muted-foreground">Geographic coverage</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coffee Farmers</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.coffeeFarmers || 0}</div>
              <p className="text-xs text-muted-foreground">Coffee value chain</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tea Farmers</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.teaFarmers || 0}</div>
              <p className="text-xs text-muted-foreground">Tea value chain</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technology Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.technology.adoption.find((t) => t.name === "Uses Technology")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">Tech adoption rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Demographics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
              <CardDescription>Breakdown of respondents by gender</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.demographics.gender}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data?.demographics.gender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Age Groups</CardTitle>
              <CardDescription>Age distribution of respondents</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.demographics.ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Business Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Industry Involvement</CardTitle>
              <CardDescription>Coffee vs Tea value chain participation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.business.industrySummary}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.business.industrySummary.map((entry, index) => (
                      <Cell key={`cell-summary-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Pie
                    data={data?.business.industry}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.business.industry.map((entry, index) => (
                      <Cell key={`cell-detail-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Value Chain Stage</CardTitle>
              <CardDescription>Distribution across value chain stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.business.valueChainStage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
              {data?.business.processingTeaStats && (
                <p className="mt-4 text-xs text-muted-foreground">
                  {`Please note ${data.business.processingTeaStats.percentage.toFixed(2)}% of ${data.business.processingTeaStats.count} Processing respondents, are doing it at a Casual labor basis under other employees and not at an Entrepreneurship level.`}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Business Challenges */}
        <Card className="mb-8">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Top Business Challenges</CardTitle>
              <CardDescription>Links between groups and their challenges</CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button variant="outline" size="icon" onClick={zoomOut} aria-label="Zoom out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={zoomIn} aria-label="Zoom in">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="w-full overflow-y-auto overflow-x-hidden"
              style={{ maxHeight: 400 }}
            >
              <div
                style={{
                  width: `${100 / sankeyZoom}%`,
                  height: sankeyHeight / sankeyZoom,
                  transform: `scale(${sankeyZoom})`,
                  transformOrigin: "top left",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <Sankey
                    data={data?.business.challengeSankey}
                    nodeWidth={15}
                    nodePadding={40}
                    node={{ fill: "#10B981", stroke: "#065F46", strokeWidth: 1 }}
                    link={{ stroke: "#3B82F6", strokeOpacity: 0.5 }}
                    margin={{ top: 20, bottom: 20 }}
                  >
                    <Tooltip />
                  </Sankey>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Adoption */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technology Adoption</CardTitle>
            <CardDescription>Technology usage among respondents</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.technology.adoption}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data?.technology.adoption.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Respondents by district</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data?.geography.districts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Education and Occupation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Education Levels</CardTitle>
              <CardDescription>Educational background of respondents</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.demographics.education}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06B6D4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Occupations</CardTitle>
              <CardDescription>Primary occupations of respondents</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.business.occupation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#84CC16" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
