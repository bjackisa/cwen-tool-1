"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, User, Calendar, Save } from "lucide-react"
import Link from "next/link"

interface OriginalRespondent {
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
  value_chain_stage: string
  other_economic_activities: string
  business_challenges: string[]
  has_business_training: boolean
  is_business_registered: boolean
  has_financial_access: boolean
  uses_technology: boolean
  business_future_plans: string[]
  support_needed: string
  group_name: string
  created_at: string
}

export default function NewFollowupPage() {
  const params = useParams()
  const router = useRouter()
  const respondentId = params.id as string

  const [originalData, setOriginalData] = useState<OriginalRespondent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    progress_since_last_visit: "",
    current_age: "",
    current_occupation: "",
    current_household_size: "",
    current_industry_involvement: "",
    current_value_chain_role: "",
    current_value_chain_stage: "",
    new_economic_activities: "",
    business_growth_status: "",
    revenue_change: "",
    challenges_resolved: [] as string[],
    new_challenges: [] as string[],
    current_business_training: false,
    current_business_registration: false,
    current_financial_access: false,
    new_buyers: [] as string[],
    new_support_services: [] as string[],
    technology_adoption_progress: "",
    new_technologies_used: [] as string[],
    remaining_technology_barriers: [] as string[],
    previous_goals_achieved: [] as string[],
    goals_not_achieved: [] as string[],
    reasons_for_unachieved_goals: "",
    updated_business_plans: [] as string[],
    new_support_needed: "",
    recommendations: "",
    additional_notes: "",
  })

  useEffect(() => {
    fetchOriginalData()
  }, [respondentId])

  const fetchOriginalData = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("survey_respondents").select("*").eq("id", respondentId).single()

      if (error) throw error
      setOriginalData(data)

      // Pre-populate current data with original data
      setFormData((prev) => ({
        ...prev,
        current_age: data.age || "",
        current_occupation: data.occupation || "",
        current_household_size: data.household_size || "",
        current_industry_involvement: data.industry_involvement || "",
        current_value_chain_role: data.value_chain_role || "",
        current_value_chain_stage: data.value_chain_stage || "",
        current_business_training: data.has_business_training || false,
        current_business_registration: data.is_business_registered || false,
        current_financial_access: data.has_financial_access || false,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to submit a follow-up survey")
      }

      const { error: insertError } = await supabase.from("followup_surveys").insert({
        original_respondent_id: respondentId,
        ...formData,
        conducted_by: user.id,
      })

      if (insertError) throw insertError

      setSuccess("Follow-up survey submitted successfully!")
      setTimeout(() => {
        router.push("/followup")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading respondent data...</p>
        </div>
      </div>
    )
  }

  if (!originalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Respondent not found</p>
          <Link href="/followup">
            <Button>Back to Follow-up List</Button>
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
            <Link href="/followup" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Follow-up List
            </Link>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">New Follow-up Survey</h1>
              <p className="text-sm text-gray-600">Follow-up for {originalData.respondent_name || "Unknown"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>
        )}

        {/* Original Data Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Original Survey Data
            </CardTitle>
            <CardDescription>Reference information from the original survey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {originalData.respondent_name || "N/A"}
              </div>
              <div>
                <span className="font-medium">Location:</span> {originalData.district}, {originalData.sub_county}
              </div>
              <div>
                <span className="font-medium">Age:</span> {originalData.age}
              </div>
              <div>
                <span className="font-medium">Gender:</span> {originalData.gender}
              </div>
              <div>
                <span className="font-medium">Occupation:</span> {originalData.occupation}
              </div>
              <div>
                <span className="font-medium">Industry:</span> {originalData.industry_involvement}
              </div>
              <div>
                <span className="font-medium">Value Chain Role:</span> {originalData.value_chain_role}
              </div>
              <div>
                <span className="font-medium">Group:</span> {originalData.group_name || "N/A"}
              </div>
              <div>
                <span className="font-medium">Original Survey:</span>{" "}
                {new Date(originalData.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Progress Since Last Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="progress_since_last_visit">Overall Progress</Label>
                <Select
                  value={formData.progress_since_last_visit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, progress_since_last_visit: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select progress" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Updated Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Updated Demographics</CardTitle>
              <CardDescription>Update any demographic information that has changed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="current_age">Current Age</Label>
                  <Select
                    value={formData.current_age}
                    onValueChange={(value) =>
                      setFormData({ ...formData, current_age: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15-24">15-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current_occupation">Current Occupation</Label>
                  <Select
                    value={formData.current_occupation}
                    onValueChange={(value) => setFormData({ ...formData, current_occupation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Farmer">Farmer</SelectItem>
                      <SelectItem value="Entreprenuer">Entrepreneur</SelectItem>
                      <SelectItem value="Salaried job">Salaried job</SelectItem>
                      <SelectItem value="Casual worker">Casual worker</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current_household_size">Current Household Size</Label>
                  <Select
                    value={formData.current_household_size}
                    onValueChange={(value) =>
                      setFormData({ ...formData, current_household_size: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3</SelectItem>
                      <SelectItem value="4-6">4-6</SelectItem>
                      <SelectItem value="7+">7+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Business Progress</CardTitle>
              <CardDescription>Track changes in business status and growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_growth_status">Business Growth Status</Label>
                  <Select
                    value={formData.business_growth_status}
                    onValueChange={(value) => setFormData({ ...formData, business_growth_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select growth status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Expanded">Expanded</SelectItem>
                      <SelectItem value="Same">Same</SelectItem>
                      <SelectItem value="Declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="revenue_change">Revenue Change</Label>
                  <Select
                    value={formData.revenue_change}
                    onValueChange={(value) => setFormData({ ...formData, revenue_change: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select revenue change" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Increased">Increased</SelectItem>
                      <SelectItem value="Same">Same</SelectItem>
                      <SelectItem value="Decreased">Decreased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="new_economic_activities">New Economic Activities</Label>
                <Select
                  value={formData.new_economic_activities}
                  onValueChange={(value) =>
                    setFormData({ ...formData, new_economic_activities: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="crop farming">Crop farming</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Technology Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Adoption Progress</CardTitle>
              <CardDescription>Track progress in technology usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="technology_adoption_progress">Technology Adoption Progress</Label>
                <Select
                  value={formData.technology_adoption_progress}
                  onValueChange={(value) =>
                    setFormData({ ...formData, technology_adoption_progress: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select progress" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Goals and Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Goals and Achievements</CardTitle>
              <CardDescription>Track achievement of previous goals and new objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reasons_for_unachieved_goals">Reasons for Unachieved Goals</Label>
                <Select
                  value={formData.reasons_for_unachieved_goals}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reasons_for_unachieved_goals: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lack of funds">Lack of funds</SelectItem>
                    <SelectItem value="training needed">Training needed</SelectItem>
                    <SelectItem value="market constraints">Market constraints</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="new_support_needed">New Support Needed</Label>
                <Select
                  value={formData.new_support_needed}
                  onValueChange={(value) =>
                    setFormData({ ...formData, new_support_needed: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select support" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="market access">Market access</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Current Status Checkboxes */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>Update current status of various aspects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="current_business_training"
                    checked={formData.current_business_training}
                    onCheckedChange={(checked) => setFormData({ ...formData, current_business_training: !!checked })}
                  />
                  <Label htmlFor="current_business_training">Has business training</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="current_business_registration"
                    checked={formData.current_business_registration}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, current_business_registration: !!checked })
                    }
                  />
                  <Label htmlFor="current_business_registration">Business is registered</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="current_financial_access"
                    checked={formData.current_financial_access}
                    onCheckedChange={(checked) => setFormData({ ...formData, current_financial_access: !!checked })}
                  />
                  <Label htmlFor="current_financial_access">Has financial access</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations and Notes</CardTitle>
              <CardDescription>Additional observations and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Select
                  value={formData.recommendations}
                  onValueChange={(value) =>
                    setFormData({ ...formData, recommendations: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continue current strategy">Continue current strategy</SelectItem>
                    <SelectItem value="invest in training">Invest in training</SelectItem>
                    <SelectItem value="seek financial support">Seek financial support</SelectItem>
                    <SelectItem value="consider partnership">Consider partnership</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="additional_notes">Additional Notes</Label>
                <Select
                  value={formData.additional_notes}
                  onValueChange={(value) =>
                    setFormData({ ...formData, additional_notes: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select note" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="needs follow up">Needs follow up</SelectItem>
                    <SelectItem value="success story">Success story</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/followup">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Follow-up Survey"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
