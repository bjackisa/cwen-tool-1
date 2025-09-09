"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { normalize, toTitleCase } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts"

interface FollowupTabProps {
  selectedDistrict: string
  selectedGender: string
  selectedGroup: string
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]

export default function FollowupTab({
  selectedDistrict,
  selectedGender,
  selectedGroup,
}: FollowupTabProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [summary, setSummary] = useState({
    totalRespondents: 0,
    totalFollowups: 0,
    newMembers: 0,
    newRespondentPct: 0,
  })

  const [practices, setPractices] = useState<{ name: string; value: number }[]>([])
  const [frequencies, setFrequencies] = useState<{ name: string; value: number }[]>([])
  const [results, setResults] = useState<{ name: string; value: number }[]>([])
  const [groupProgress, setGroupProgress] = useState<
    { name: string; value: number; color: string }[]
  >([])

  useEffect(() => {
    fetchData()
  }, [selectedDistrict, selectedGender, selectedGroup])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      let respQuery = supabase.from("survey_respondents").select("*")
      if (selectedDistrict !== "all")
        respQuery = respQuery.ilike("district", normalize(selectedDistrict))
      if (selectedGender !== "all")
        respQuery = respQuery.ilike("gender", normalize(selectedGender))
      if (selectedGroup !== "all")
        respQuery = respQuery.ilike("group_name", normalize(selectedGroup))
      const { data: respondents } = await respQuery
      const totalRespondents = respondents?.length || 0
      const newRespondents = (respondents || []).filter(
        (r) => !r.household_size,
      ).length

      let followQuery = supabase
        .from("followup_surveys")
        .select("*, original_respondent:survey_respondents(group_name,district,gender)")
      if (selectedDistrict !== "all")
        followQuery = followQuery.ilike(
          "original_respondent.district",
          normalize(selectedDistrict),
        )
      if (selectedGender !== "all")
        followQuery = followQuery.ilike(
          "original_respondent.gender",
          normalize(selectedGender),
        )
      if (selectedGroup !== "all")
        followQuery = followQuery.ilike(
          "original_respondent.group_name",
          normalize(selectedGroup),
        )
      const { data: followups } = await followQuery
      const totalFollowups = followups?.length || 0
      const newMembers = (followups || []).filter(
        (f) => f.attended_training === false,
      ).length
      const newRespondentPct =
        totalRespondents > 0 ? (newRespondents / totalRespondents) * 100 : 0

      const practiceCounts: Record<string, number> = {}
      const freqCounts: Record<string, number> = {
        Never: 0,
        Occasionally: 0,
        Monthly: 0,
        Weekly: 0,
        Daily: 0,
        "New Member": 0,
      }
      const resultCounts: Record<string, number> = {}
      const progressSums: Record<string, { sum: number; count: number }> = {}

      ;(followups || []).forEach((f) => {
        ;(f.practices_applied || []).forEach((p: string) => {
          const name = toTitleCase(p)
          practiceCounts[name] = (practiceCounts[name] || 0) + 1
        })

        const freq = f.practice_frequency
        if (freq == null) freqCounts["New Member"]++
        else if (freq === 1) freqCounts["Never"]++
        else if (freq === 2) freqCounts["Occasionally"]++
        else if (freq === 3) freqCounts["Monthly"]++
        else if (freq === 4) freqCounts["Weekly"]++
        else if (freq === 5) freqCounts["Daily"]++

        ;(f.practice_results || []).forEach((r: string) => {
          const name = toTitleCase(r)
          resultCounts[name] = (resultCounts[name] || 0) + 1
        })

        const group = toTitleCase(f.original_respondent?.group_name || "Unknown")
        const gp = f.group_progress
        if (gp != null) {
          if (!progressSums[group]) progressSums[group] = { sum: 0, count: 0 }
          progressSums[group].sum += gp
          progressSums[group].count += 1
        }
      })

      const practicesData = Object.entries(practiceCounts).map(([name, value]) => ({
        name,
        value,
      }))
      const freqData = Object.entries(freqCounts).map(([name, value]) => ({
        name,
        value,
      }))
      const resultsData = Object.entries(resultCounts).map(([name, value]) => ({
        name,
        value,
      }))
      const gpData = Object.entries(progressSums).map(([name, { sum, count }], i) => ({
        name,
        value: sum / count,
        color: COLORS[i % COLORS.length],
      }))

      setSummary({
        totalRespondents,
        totalFollowups,
        newMembers,
        newRespondentPct,
      })
      setPractices(practicesData)
      setFrequencies(freqData)
      setResults(resultsData)
      setGroupProgress(gpData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading)
    return <div className="text-center py-8">Loading follow-up data...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.totalRespondents}</div>
            <div className="text-sm text-muted-foreground">Total Respondents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.totalFollowups}</div>
            <div className="text-sm text-muted-foreground">Follow-up Responses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.newMembers}</div>
            <div className="text-sm text-muted-foreground">New Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.newRespondentPct.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">New Respondents</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills Applied</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={practices}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Frequency</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={frequencies} innerRadius={60} outerRadius={100}>
                {frequencies.map((entry, index) => (
                  <Cell key={`freq-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Results</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={results}>
                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={groupProgress}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="value">
                {groupProgress.map((entry, index) => (
                  <Cell key={`gp-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

