"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
                <Label htmlFor="progress_since_last_visit">Overall Progress Description</Label>
                <Textarea
                  id="progress_since_last_visit"
                  value={formData.progress_since_last_visit}
                  onChange={(e) => setFormData({ ...formData, progress_since_last_visit: e.target.value })}
                  placeholder="Describe the overall progress since the last visit..."
                  rows={4}
                  required
                />
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
                  <Input
                    id="current_age"
                    value={formData.current_age}
                    onChange={(e) => setFormData({ ...formData, current_age: e.target.value })}
                    placeholder="Current age"
                  />
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
                  <Input
                    id="current_household_size"
                    value={formData.current_household_size}
                    onChange={(e) => setFormData({ ...formData, current_household_size: e.target.value })}
                    placeholder="Number of people"
                  />
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
                <Textarea
                  id="new_economic_activities"
                  value={formData.new_economic_activities}
                  onChange={(e) => setFormData({ ...formData, new_economic_activities: e.target.value })}
                  placeholder="Describe any new economic activities started..."
                  rows={3}
                />
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
                <Textarea
                  id="technology_adoption_progress"
                  value={formData.technology_adoption_progress}
                  onChange={(e) => setFormData({ ...formData, technology_adoption_progress: e.target.value })}
                  placeholder="Describe progress in technology adoption..."
                  rows={3}
                />
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
                <Textarea
                  id="reasons_for_unachieved_goals"
                  value={formData.reasons_for_unachieved_goals}
                  onChange={(e) => setFormData({ ...formData, reasons_for_unachieved_goals: e.target.value })}
                  placeholder="Explain why some goals were not achieved..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="new_support_needed">New Support Needed</Label>
                <Textarea
                  id="new_support_needed"
                  value={formData.new_support_needed}
                  onChange={(e) => setFormData({ ...formData, new_support_needed: e.target.value })}
                  placeholder="What support is needed going forward..."
                  rows={3}
                />
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
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="Provide recommendations for the respondent..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="additional_notes">Additional Notes</Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                  placeholder="Any additional observations or notes..."
                  rows={4}
                />
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
