"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Download, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"

interface Respondent {
  id: string
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
  const [filteredRespondents, setFilteredRespondents] = useState<Respondent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDistrict, setFilterDistrict] = useState("")
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    fetchRespondents()
  }, [])

  useEffect(() => {
    filterData()
  }, [respondents, searchTerm, filterDistrict])

  const fetchRespondents = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("survey_respondents")
        .select(
          `
          id, district, sub_county, parish, age, gender, education_level, 
          occupation, industry_involvement, value_chain_role, respondent_name, 
          group_name, created_at
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setRespondents(data || [])
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

    if (filterDistrict) {
      filtered = filtered.filter((respondent) => respondent.district === filterDistrict)
    }

    setFilteredRespondents(filtered)
    setPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this respondent?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("survey_respondents").delete().eq("id", id)

      if (error) throw error
      await fetchRespondents()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const exportData = () => {
    const csvContent = [
      [
        "Name",
        "District",
        "Sub-county",
        "Parish",
        "Age",
        "Gender",
        "Education",
        "Occupation",
        "Industry",
        "Role",
        "Group",
        "Date Added",
      ],
      ...filteredRespondents.map((r) => [
        r.respondent_name || "",
        r.district || "",
        r.sub_county || "",
        r.parish || "",
        r.age || "",
        r.gender || "",
        r.education_level || "",
        r.occupation || "",
        r.industry_involvement || "",
        r.value_chain_role || "",
        r.group_name || "",
        new Date(r.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "survey_respondents.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const uniqueDistricts = [...new Set(respondents.map((r) => r.district).filter(Boolean))]
  const itemsPerPage = 15
  const pageCount = Math.ceil(filteredRespondents.length / itemsPerPage)
  const paginatedRespondents = filteredRespondents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  )

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
                <h1 className="text-2xl font-bold text-gray-900">Survey Respondents</h1>
                <p className="text-sm text-gray-600">Manage and view all survey respondents</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Link href="/data-import">
                <Button size="sm">Add New</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, group, or district..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Districts</SelectItem>
                    {uniqueDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {paginatedRespondents.length} of {filteredRespondents.length} respondents
            </div>
          </CardContent>
        </Card>

        {/* Respondents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Respondents List</CardTitle>
            <CardDescription>All survey respondents and their basic information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Demographics</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRespondents.map((respondent) => (
                    <TableRow key={respondent.id}>
                      <TableCell className="font-medium">{respondent.respondent_name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{respondent.district}</div>
                          <div className="text-gray-500">
                            {respondent.sub_county}, {respondent.parish}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {respondent.gender}, {respondent.age}
                          </div>
                          <div className="text-gray-500">{respondent.education_level}</div>
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
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/respondents/${respondent.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(respondent.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRespondents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || filterDistrict ? "No respondents match your filters." : "No respondents found."}
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
