"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2 } from "lucide-react"

interface Respondent {
  id: string
  timestamp: string
  district: string
  sub_county: string
  parish: string
  age: string
  gender: string
  education_level: string
  occupation: string
  industry_involvement: string
  value_chain_role: string
  respondent_name: string
  group_name: string
  created_at: string
}

export default function RespondentsPage() {
  const [respondents, setRespondents] = useState<Respondent[]>([])
  const [filtered, setFiltered] = useState<Respondent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [district, setDistrict] = useState("")
  const [gender, setGender] = useState("")
  const [industry, setIndustry] = useState("")
  const [districts, setDistricts] = useState<string[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    loadRespondents()
  }, [])

  useEffect(() => {
    let data = respondents
    if (search) {
      const term = search.toLowerCase()
      data = data.filter(
        (r) =>
          r.respondent_name?.toLowerCase().includes(term) ||
          r.group_name?.toLowerCase().includes(term) ||
          r.district?.toLowerCase().includes(term) ||
          r.parish?.toLowerCase().includes(term),
      )
    }
    if (district) {
      data = data.filter((r) => r.district === district)
    }
    if (gender) {
      data = data.filter((r) => r.gender === gender)
    }
    if (industry) {
      data = data.filter((r) => r.industry_involvement === industry)
    }
    setFiltered(data)
  }, [respondents, search, district, gender, industry])

  const loadRespondents = async () => {
    try {
      const supabase = createClient()
      const [resp, dist, inds] = await Promise.all([
        supabase.from("survey_respondents").select("*").order("timestamp", { ascending: false }),
        supabase.from("districts").select("name").order("name"),
        supabase.from("industries").select("name").order("name"),
      ])
      if (resp.error) throw resp.error
      setRespondents(resp.data || [])
      setDistricts((dist.data || []).map((d) => d.name))
      setIndustries((inds.data || []).map((i) => i.name))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this respondent?")) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("survey_respondents").delete().eq("id", id)
      if (error) throw error
      setRespondents((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const genders = Array.from(new Set(respondents.map((r) => r.gender).filter(Boolean))).sort()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading respondents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, group or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Genders</option>
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Industries</option>
                  {industries.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Respondents */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Respondents</CardTitle>
            <CardDescription>
              Complete list of all survey respondents available for follow-up surveys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {r.respondent_name || "Unnamed Respondent"}
                        </h3>
                        {r.gender && <Badge variant="outline">{r.gender}</Badge>}
                        {r.age && <Badge variant="outline">{r.age} years</Badge>}
                        {r.industry_involvement && (
                          <Badge variant="secondary">{r.industry_involvement}</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Location:</span> {r.district}, {r.sub_county}
                          {r.parish && `, ${r.parish}`}
                        </div>
                        <div>
                          <span className="font-medium">Occupation:</span> {r.occupation}
                        </div>
                        <div>
                          <span className="font-medium">Education:</span> {r.education_level}
                        </div>
                        {r.group_name && (
                          <div>
                            <span className="font-medium">Group:</span> {r.group_name}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Survey Date:</span>{" "}
                          {new Date(r.timestamp || r.created_at).toLocaleDateString()}
                        </div>
                        {r.value_chain_role && (
                          <div>
                            <span className="font-medium">Role:</span> {r.value_chain_role}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/followup/new/${r.id}`)}
                      >
                        Start Follow-up
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/respondents/${r.id}`)}
                      >
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
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

