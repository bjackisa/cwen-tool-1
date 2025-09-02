"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"

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

interface Industry {
  id: string
  name: string
}

export default function RespondentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [respondent, setRespondent] = useState<Respondent | null>(null)
  const [formData, setFormData] = useState<Respondent | null>(null)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const [resp, inds, links] = await Promise.all([
          supabase
            .from("survey_respondents")
            .select(
              `id, district, sub_county, parish, age, gender, education_level,
              occupation, industry_involvement, value_chain_role, respondent_name,
              group_name, created_at`
            )
            .eq("id", id)
            .single(),
          supabase.from("industries").select("*").order("name"),
          supabase.from("respondent_industries").select("industry_id").eq("respondent_id", id),
        ])

        if (resp.error) throw resp.error
        setRespondent(resp.data)
        setFormData(resp.data)
        setIndustries((inds.data || []) as Industry[])
        setSelectedIndustries((links.data || []).map((l: any) => l.industry_id))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleChange = (field: keyof Respondent, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSave = async () => {
    if (!formData) return
    const supabase = createClient()
    const names = selectedIndustries
      .map((id) => industries.find((i) => i.id === id)?.name)
      .filter(Boolean)
      .join(", ")
    const { error } = await supabase
      .from("survey_respondents")
      .update({
        district: formData.district,
        sub_county: formData.sub_county,
        parish: formData.parish,
        age: formData.age,
        gender: formData.gender,
        education_level: formData.education_level,
        occupation: formData.occupation,
        industry_involvement: names,
        value_chain_role: formData.value_chain_role,
        respondent_name: formData.respondent_name,
        group_name: formData.group_name,
      })
      .eq("id", id)

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from("respondent_industries").delete().eq("respondent_id", id)
    if (selectedIndustries.length) {
      const rows = selectedIndustries.map((indId) => ({ respondent_id: id, industry_id: indId }))
      await supabase.from("respondent_industries").insert(rows)
    }

    setRespondent({ ...formData, industry_involvement: names })
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading respondent...
      </div>
    )
  }

  if (error || !respondent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Respondent not found"}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              className="flex items-center"
              onClick={() => router.push("/respondents")}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Respondents
            </Button>
            <h1 className="ml-4 text-xl font-semibold">Respondent Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{respondent.respondent_name || "Unnamed Respondent"}</CardTitle>
            <CardDescription>View and edit respondent information</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing && formData ? (
              <div className="space-y-4">
                <Input
                  value={formData.respondent_name || ""}
                  onChange={(e) => handleChange("respondent_name", e.target.value)}
                  placeholder="Name"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={formData.district || ""}
                    onChange={(e) => handleChange("district", e.target.value)}
                    placeholder="District"
                  />
                  <Input
                    value={formData.sub_county || ""}
                    onChange={(e) => handleChange("sub_county", e.target.value)}
                    placeholder="Sub-county"
                  />
                  <Input
                    value={formData.parish || ""}
                    onChange={(e) => handleChange("parish", e.target.value)}
                    placeholder="Parish"
                  />
                  <Input
                    value={formData.age || ""}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="Age"
                  />
                  <Input
                    value={formData.gender || ""}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    placeholder="Gender"
                  />
                  <Input
                    value={formData.education_level || ""}
                    onChange={(e) => handleChange("education_level", e.target.value)}
                    placeholder="Education Level"
                  />
                  <Input
                    value={formData.occupation || ""}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                    placeholder="Occupation"
                  />
                  <div className="col-span-2">
                    <div className="font-medium mb-2">Industries</div>
                    <div className="space-y-2">
                      {industries.map((ind) => (
                        <label key={ind.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedIndustries.includes(ind.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIndustries((prev) =>
                                checked ? [...prev, ind.id] : prev.filter((i) => i !== ind.id),
                              )
                            }}
                          />
                          <span>{ind.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Input
                    value={formData.value_chain_role || ""}
                    onChange={(e) => handleChange("value_chain_role", e.target.value)}
                    placeholder="Role"
                  />
                  <Input
                    value={formData.group_name || ""}
                    onChange={(e) => handleChange("group_name", e.target.value)}
                    placeholder="Group"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData(respondent)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">District:</span> {respondent.district}
                </div>
                <div>
                  <span className="font-medium">Sub-county:</span> {respondent.sub_county}
                </div>
                <div>
                  <span className="font-medium">Parish:</span> {respondent.parish}
                </div>
                <div>
                  <span className="font-medium">Age:</span> {respondent.age}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {respondent.gender}
                </div>
                <div>
                  <span className="font-medium">Education:</span> {respondent.education_level}
                </div>
                <div>
                  <span className="font-medium">Occupation:</span> {respondent.occupation}
                </div>
                <div>
                  <span className="font-medium">Industry:</span> {respondent.industry_involvement}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {respondent.value_chain_role}
                </div>
                <div>
                  <span className="font-medium">Group:</span> {respondent.group_name}
                </div>
                <div>
                  <span className="font-medium">Date Added:</span> {new Date(respondent.created_at).toLocaleDateString()}
                </div>
                <Button className="mt-4" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

