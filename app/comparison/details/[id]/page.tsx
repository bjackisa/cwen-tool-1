"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"

interface DetailedComparison {
  original: {
    id: string
    respondent_name: string
    district: string
    sub_county: string
    parish: string
    age: string
    gender: string
    education_level: string
    occupation: string
    household_size: string
    industry_involvement: string
    value_chain_role: string
    has_business_training: boolean
    is_business_registered: boolean
    has_financial_access: boolean
    uses_technology: boolean
    other_economic_activities: string
    business_challenges: string[]
    support_needed: string
    group_name: string
    created_at: string
  }
  followups: {
    id: string
    visit_date: string
    progress_since_last_visit: string
    current_age: string
    current_occupation: string
    current_household_size: string
    business_growth_status: string
    revenue_change: string
    current_business_training: boolean
    current_business_registration: boolean
    current_financial_access: boolean
    technology_adoption_progress: string
    new_support_needed: string
    recommendations: string
    additional_notes: string
  }[]
}

export default function ComparisonDetailsPage() {
  const params = useParams()
  const respondentId = params.id as string

  const [data, setData] = useState<DetailedComparison | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDetailedComparison()
  }, [respondentId])

  const fetchDetailedComparison = async () => {
    try {
      const supabase = createClient()

      // Get original survey data
      const { data: originalData, error: originalError } = await supabase
        .from("survey_respondents")
        .select("*")
        .eq("id", respondentId)
        .single()

      if (originalError) throw originalError

      // Get follow-up surveys
      const { data: followupData, error: followupError } = await supabase
        .from("followup_surveys")
        .select("*")
        .eq("original_respondent_id", respondentId)
        .order("visit_date", { ascending: true })

      if (followupError) throw followupError

      setData({
        original: originalData,
        followups: followupData || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
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
          <p className="mt-4 text-gray-600">Loading comparison details...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Data not found"}</p>
          <Link href="/comparison">
            <Button>Back to Comparison</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/comparison" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Comparison
            </Link>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">Detailed Comparison</h1>
              <p className="text-sm text-gray-600">{data.original.respondent_name || "Unknown"} - Progress Analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Respondent Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Respondent Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {data.original.respondent_name || "N/A"}
              </div>
              <div>
                <span className="font-medium">Location:</span> {data.original.district}, {data.original.sub_county}
              </div>
              <div>
                <span className="font-medium">Industry:</span> {data.original.industry_involvement}
              </div>
              <div>
                <span className="font-medium">Follow-ups:</span> {data.followups.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Progress Timeline
            </CardTitle>
            <CardDescription>Chronological view of all surveys and follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Original Survey */}
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-900">Original Survey</h4>
                    <span className="text-sm text-blue-700">
                      {new Date(data.original.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 mt-1">
                    Initial survey completed - {data.original.occupation} in {data.original.value_chain_role} role
                  </p>
                </div>
              </div>

              {/* Follow-up Surveys */}
              {data.followups.map((followup, index) => (
                <div key={followup.id} className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-green-900">Follow-up Survey #{index + 1}</h4>
                      <span className="text-sm text-green-700">
                        {new Date(followup.visit_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-green-800 mt-1">
                      {followup.progress_since_last_visit || "Progress update completed"}
                    </p>
                    {followup.business_growth_status && (
                      <div className="mt-2">
                        <Badge
                          variant={
                            followup.business_growth_status === "Expanded"
                              ? "default"
                              : followup.business_growth_status === "Declined"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          Business: {followup.business_growth_status}
                        </Badge>
                        {followup.revenue_change && (
                          <Badge
                            variant={
                              followup.revenue_change === "Increased"
                                ? "default"
                                : followup.revenue_change === "Decreased"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="ml-2"
                          >
                            Revenue: {followup.revenue_change}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Comparison */}
        {data.followups.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Demographics Changes</CardTitle>
                <CardDescription>Changes in personal and household information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Age</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {data.original.age} →{" "}
                        {data.followups[data.followups.length - 1].current_age || data.original.age}
                      </span>
                      {getChangeIndicator(
                        data.original.age,
                        data.followups[data.followups.length - 1].current_age || data.original.age,
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Occupation</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {data.original.occupation} →{" "}
                        {data.followups[data.followups.length - 1].current_occupation || data.original.occupation}
                      </span>
                      {getChangeIndicator(
                        data.original.occupation,
                        data.followups[data.followups.length - 1].current_occupation || data.original.occupation,
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Household Size</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {data.original.household_size} →{" "}
                        {data.followups[data.followups.length - 1].current_household_size ||
                          data.original.household_size}
                      </span>
                      {getChangeIndicator(
                        data.original.household_size,
                        data.followups[data.followups.length - 1].current_household_size ||
                          data.original.household_size,
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Business Progress</CardTitle>
                <CardDescription>Changes in business status and capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Business Training</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {data.original.has_business_training ? "Yes" : "No"} →{" "}
                        {data.followups[data.followups.length - 1].current_business_training ? "Yes" : "No"}
                      </span>
                      {getChangeIndicator(
                        data.original.has_business_training,
                        data.followups[data.followups.length - 1].current_business_training,
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Business Registration</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {data.original.is_business_registered ? "Yes" : "No"} →{" "}
                        {data.followups[data.followups.length - 1].current_business_registration ? "Yes" : "No"}
                      </span>
                      {getChangeIndicator(
                        data.original.is_business_registered,
                        data.followups[data.followups.length - 1].current_business_registration,
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Financial Access</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {data.original.has_financial_access ? "Yes" : "No"} →{" "}
                        {data.followups[data.followups.length - 1].current_financial_access ? "Yes" : "No"}
                      </span>
                      {getChangeIndicator(
                        data.original.has_financial_access,
                        data.followups[data.followups.length - 1].current_financial_access,
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Follow-up Details */}
        {data.followups.map((followup, index) => (
          <Card key={followup.id} className="mt-6">
            <CardHeader>
              <CardTitle>Follow-up Survey #{index + 1} Details</CardTitle>
              <CardDescription>Conducted on {new Date(followup.visit_date).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Progress Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {followup.progress_since_last_visit || "No description provided"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Technology Progress</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {followup.technology_adoption_progress || "No technology progress reported"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {followup.recommendations || "No recommendations provided"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Additional Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {followup.additional_notes || "No additional notes"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  )
}
