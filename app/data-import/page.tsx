"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, MapPin, ArrowLeft, Download, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SurveyRespondent {
  id: number
  timestamp: string
  district: string
  sub_county: string
  parish: string
  age: string
  gender: string
  education_level: string
  marital_status: string
  occupation: string
  household_size: string
  has_disability: boolean
  industry_involvement: string
  value_chain_role: string
  other_economic_activities: string
  business_challenges: string
  respondent_name: string
  group_name: string
  created_at: string
}

export default function DataImportPage({ embedded = false }: { embedded?: boolean }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [respondents, setRespondents] = useState<SurveyRespondent[]>([])
  const [filteredRespondents, setFilteredRespondents] = useState<SurveyRespondent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadSurveyData()
  }, [])

  useEffect(() => {
    let filtered = respondents

    if (searchTerm) {
      filtered = filtered.filter(
        (respondent) =>
          respondent.respondent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          respondent.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          respondent.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          respondent.parish?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedDistrict) {
      filtered = filtered.filter((respondent) => respondent.district === selectedDistrict)
    }

    if (selectedGender) {
      filtered = filtered.filter((respondent) => respondent.gender === selectedGender)
    }

    if (selectedIndustry) {
      filtered = filtered.filter((respondent) => respondent.industry_involvement === selectedIndustry)
    }

    setFilteredRespondents(filtered)
  }, [respondents, searchTerm, selectedDistrict, selectedGender, selectedIndustry])

  const loadSurveyData = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("survey_respondents")
        .select("*")
        .order("timestamp", { ascending: false })

      if (error) throw error

      setRespondents(data || [])
      setFilteredRespondents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred loading data")
    } finally {
      setIsLoading(false)
    }
  }

  const uniqueDistricts = [...new Set(respondents.map((r) => r.district).filter(Boolean))].sort()
  const uniqueGenders = [...new Set(respondents.map((r) => r.gender).filter(Boolean))].sort()
  const uniqueIndustries = [...new Set(respondents.map((r) => r.industry_involvement).filter(Boolean))].sort()

  const exportData = () => {
    const csvContent = [
      // CSV headers
      [
        "Name",
        "District",
        "Sub-county",
        "Parish",
        "Age",
        "Gender",
        "Education",
        "Marital Status",
        "Occupation",
        "Industry",
        "Value Chain Role",
        "Group Name",
        "Survey Date",
      ].join(","),
      // CSV data
      ...filteredRespondents.map((respondent) =>
        [
          respondent.respondent_name || "",
          respondent.district || "",
          respondent.sub_county || "",
          respondent.parish || "",
          respondent.age || "",
          respondent.gender || "",
          respondent.education_level || "",
          respondent.marital_status || "",
          respondent.occupation || "",
          respondent.industry_involvement || "",
          respondent.value_chain_role || "",
          respondent.group_name || "",
          new Date(respondent.timestamp).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `survey_respondents_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-50"}>
      {!embedded && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </Link>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">Survey Data Overview</h1>
                  <p className="text-sm text-gray-600">
                    {filteredRespondents.length} of {respondents.length} respondents
                  </p>
                </div>
              </div>
              <Button onClick={exportData} className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Respondents</p>
                  <p className="text-2xl font-bold text-gray-900">{respondents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Districts Covered</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueDistricts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">☕</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Coffee Farmers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {respondents.filter((r) => r.industry_involvement === "Coffee").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">🍃</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tea Farmers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {respondents.filter((r) => r.industry_involvement === "Tea").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, group, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Districts</option>
                  {uniqueDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Genders</option>
                  {uniqueGenders.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Industries</option>
                  {uniqueIndustries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Respondents List */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Respondents</CardTitle>
            <CardDescription>Complete list of all survey respondents available for follow-up surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRespondents.map((respondent) => (
                <div
                  key={respondent.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {respondent.respondent_name || "Unnamed Respondent"}
                        </h3>
                        <Badge variant="outline">{respondent.gender}</Badge>
                        <Badge variant="outline">{respondent.age} years</Badge>
                        {respondent.industry_involvement && (
                          <Badge variant="secondary">{respondent.industry_involvement}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Location:</span> {respondent.district}, {respondent.sub_county}
                          {respondent.parish && `, ${respondent.parish}`}
                        </div>
                        <div>
                          <span className="font-medium">Occupation:</span> {respondent.occupation}
                        </div>
                        <div>
                          <span className="font-medium">Education:</span> {respondent.education_level}
                        </div>
                        {respondent.group_name && (
                          <div>
                            <span className="font-medium">Group:</span> {respondent.group_name}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Survey Date:</span>{" "}
                          {new Date(respondent.timestamp).toLocaleDateString()}
                        </div>
                        {respondent.value_chain_role && (
                          <div>
                            <span className="font-medium">Role:</span> {respondent.value_chain_role}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/followup/new/${respondent.id}`)}>
                        Start Follow-up
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/respondents/${respondent.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredRespondents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No respondents found matching your search criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
