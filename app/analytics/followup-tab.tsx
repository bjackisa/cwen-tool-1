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
  Line,
} from "recharts"

interface FollowupTabProps {
  selectedDistrict: string
  selectedGender: string
  selectedGroup: string
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
]

const GP_LABELS = ["Very Poor", "Poor", "Average", "Good", "Very Good"]
const INCOME_LABELS: Record<number, string> = {
  [-1]: "I’m in debt",
  0: "UGX 0 (no change)",
  1: "UGX 50k–100k",
  2: "UGX 110k–250k",
  3: "UGX 260k–350k",
  4: "UGX 360k–500k",
  5: "UGX 510k+",
}
const EARNINGS_LABELS: Record<number, string> = {
  [-1]: "Operated at a loss / group debt",
  0: "UGX 0 (no earnings)",
  1: "UGX 1–350k",
  2: "UGX 360k–700k",
  3: "UGX 710k–1,500k",
  4: "UGX 1,510k–3,000k",
  5: "UGX 3,010k+",
}

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
    { name: string; avg: number; gpa: number; color: string }[]
  >([])
  const [incomeChanges, setIncomeChanges] = useState<
    { name: string; value: number; color: string }[]
  >([])
  const [groupEarnings, setGroupEarnings] = useState<
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
      const incomeSums: Record<string, { sum: number; count: number }> = {}
      const earningSums: Record<string, { sum: number; count: number }> = {}

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
        const income = f.income_change
        if (income != null) {
          if (!incomeSums[group]) incomeSums[group] = { sum: 0, count: 0 }
          incomeSums[group].sum += income
          incomeSums[group].count += 1
        }
        const earn = f.group_earnings
        if (earn != null) {
          if (!earningSums[group]) earningSums[group] = { sum: 0, count: 0 }
          earningSums[group].sum += earn
          earningSums[group].count += 1
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
      const gpData = Object.entries(progressSums).map(
        ([name, { sum, count }], i) => ({
          name,
          avg: sum / count,
          gpa: sum / count,
          color: COLORS[i % COLORS.length],
        }),
      )
      const incomeData = Object.entries(incomeSums).map(
        ([name, { sum, count }], i) => ({
          name,
          value: Math.round(sum / count),
          color: COLORS[i % COLORS.length],
        }),
      )
      const earningData = Object.entries(earningSums).map(
        ([name, { sum, count }], i) => ({
          name,
          value: Math.round(sum / count),
          color: COLORS[i % COLORS.length],
        }),
      )

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
      setIncomeChanges(incomeData)
      setGroupEarnings(earningData)
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <Pie
                  dataKey="value"
                  data={frequencies}
                  innerRadius={60}
                  outerRadius={100}
                  label={({ name }) => name}
                  labelLine={false}
                >
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
                  {results.map((entry, index) => (
                    <Cell key={`res-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Personal Income Change</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={incomeChanges}
                  label={({ name }) => name}
                  labelLine={false}
                >
                  {incomeChanges.map((entry, index) => (
                    <Cell key={`inc-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => INCOME_LABELS[v]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Group Earnings</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={groupEarnings}
                  label={({ name }) => name}
                  labelLine={false}
                >
                  {groupEarnings.map((entry, index) => (
                    <Cell key={`earn-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => EARNINGS_LABELS[v]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={groupProgress}>
              <XAxis dataKey="name" />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(v) => GP_LABELS[v - 1]}
              />
              <Tooltip formatter={(v) => GP_LABELS[Math.round((v as number) - 1)]} />
              <Bar dataKey="avg">
                {groupProgress.map((entry, index) => (
                  <Cell key={`gp-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="gpa" stroke="#000" />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-muted-foreground">
            Note: Progress was graded by group respondents themselves during
            follow-up and not by our on-ground observations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

