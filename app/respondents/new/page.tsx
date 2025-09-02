"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"

interface Industry {
  id: string
  name: string
}

interface Respondent {
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
}

export default function NewRespondentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<Respondent>({
    district: "",
    sub_county: "",
    parish: "",
    age: "",
    gender: "",
    education_level: "",
    occupation: "",
    industry_involvement: "",
    value_chain_role: "",
    respondent_name: "",
    group_name: "",
  })
  const [industries, setIndustries] = useState<Industry[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadIndustries = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("industries").select("*").order("name")
      if (error) {
        setError(error.message)
        return
      }
      setIndustries((data || []) as Industry[])
    }
    loadIndustries()
  }, [])

  const handleChange = (field: keyof Respondent, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const supabase = createClient()
    const names = selectedIndustries
      .map((id) => industries.find((i) => i.id === id)?.name)
      .filter(Boolean)
      .join(", ")
    const { data, error } = await supabase
      .from("survey_respondents")
      .insert({
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
      .select()
      .single()

    if (error) {
      setError(error.message)
      return
    }

    if (selectedIndustries.length) {
      const rows = selectedIndustries.map((indId) => ({
        respondent_id: data.id,
        industry_id: indId,
      }))
      await supabase.from("respondent_industries").insert(rows)
    }

    router.push("/respondents")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              className="flex items-center"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="ml-4 text-xl font-semibold">Add Respondent</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>New Respondent</CardTitle>
            <CardDescription>Enter respondent information</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 text-red-600">{error}</div>
            )}
            <div className="space-y-4">
              <Input
                value={formData.respondent_name}
                onChange={(e) => handleChange("respondent_name", e.target.value)}
                placeholder="Name"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={formData.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  placeholder="District"
                />
                <Input
                  value={formData.sub_county}
                  onChange={(e) => handleChange("sub_county", e.target.value)}
                  placeholder="Sub-county"
                />
                <Input
                  value={formData.parish}
                  onChange={(e) => handleChange("parish", e.target.value)}
                  placeholder="Parish"
                />
                <Input
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="Age"
                />
                <Input
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  placeholder="Gender"
                />
                <Input
                  value={formData.education_level}
                  onChange={(e) => handleChange("education_level", e.target.value)}
                  placeholder="Education Level"
                />
                <Input
                  value={formData.occupation}
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
                  value={formData.value_chain_role}
                  onChange={(e) => handleChange("value_chain_role", e.target.value)}
                  placeholder="Role"
                />
                <Input
                  value={formData.group_name}
                  onChange={(e) => handleChange("group_name", e.target.value)}
                  placeholder="Group"
                />
              </div>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

