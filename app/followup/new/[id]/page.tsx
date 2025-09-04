"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

interface Respondent { id: string; respondent_name: string }

const practiceOptions = [
  "Recordkeeping",
  "Costing/Unit economics",
  "Product quality/standardization",
  "Packaging/labeling",
  "Basic marketing",
  "Market linkage actions",
  "Savings/Microfinance AND Savings account discipline",
  "None yet",
  "Other",
]

const resultOptions = [
  "Better product quality",
  "Reduced costs",
  "More consistent sales",
  "Higher prices achieved",
  "Fewer customer complaints",
  "None yet",
  "Other",
]

const passionOptions = [
  "Coffee growing & value addition",
  "Tea growing & value addition",
  "Liquid soap",
  "Weaving",
  "Other",
]

const lackingOptions = [
  "More training",
  "Tools/equipment",
  "Capital/finance",
  "Market access",
  "One-on-one mentorship",
  "Quality certification/UNBS readiness",
  "Recordkeeping/financial systems",
  "Nothing",
  "Other",
]

const challengeOptions = [
  "Financial constraints",
  "Disunity/poor teamwork",
  "Non-cooperation",
  "Weak leadership",
  "Corruption among members",
  "Limited/unstable markets",
  "Poor product quality/consistency",
  "Limited technical skills",
  "Poor access to inputs/raw materials",
  "Transport/logistics constraints",
  "Climate/weather shocks",
  "Household/time constraints (care duties)",
  "Theft/security risk",
  "Other",
]

const trainingOptions = [
  "Bakery",
  "Tailoring",
  "Poultry",
  "Cattle",
  "Piggery",
  "Goat rearing",
  "Fish farming",
  "Beekeeping",
  "Mushroom",
  "Horticulture/vegetables",
  "Basic bookkeeping/finance",
  "Branding/packaging",
  "Digital marketing",
  "Other",
]

const governanceOptions = [
  "Active constitution",
  "Elected leaders",
  "Bank/Microfinance AND Savings account",
  "Basic financial records",
  "None",
]

const mentorQuestions = [
  "Training meaningfulness to you personally",
  "Impact on your livelihood/personal finances",
  "Relevance to your day-to-day work/business",
  "Clarity & practicality of delivery (examples, demos)",
  "Quality of follow-up & responsiveness after training",
  "Confidence that the skills can sustainably grow your group/business",
]

export default function NewFollowupPage() {
  const params = useParams()
  const router = useRouter()
  const respondentId = params.id as string

  const [respondent, setRespondent] = useState<Respondent | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [attended, setAttended] = useState("")
  const [practices, setPractices] = useState<string[]>([])
  const [practiceFreq, setPracticeFreq] = useState("")
  const [results, setResults] = useState<string[]>([])
  const [groupProgress, setGroupProgress] = useState("")
  const [incomeChange, setIncomeChange] = useState("")
  const [groupEarnings, setGroupEarnings] = useState("")
  const [passions, setPassions] = useState<string[]>([])
  const [otherPassion, setOtherPassion] = useState("")
  const [lacking, setLacking] = useState<string[]>([])
  const [gScores, setGScores] = useState({ g1: "", g2: "", g3: "", g4: "", g5: "", g6: "" })
  const [g7, setG7] = useState("")
  const [g8, setG8] = useState("")
  const [challenges, setChallenges] = useState<string[]>([])
  const [future, setFuture] = useState<string[]>([])
  const [feedback, setFeedback] = useState("")
  const [governance, setGovernance] = useState<string[]>([])
  const [newMarkets, setNewMarkets] = useState("")
  const [qualitySteps, setQualitySteps] = useState("")
  const [step, setStep] = useState(0)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("survey_respondents")
        .select("id, respondent_name")
        .eq("id", respondentId)
        .single()
      setRespondent(data as Respondent)
    }
    load()
  }, [respondentId])

  const toggle = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value])
  }

  const handleSubmit = async () => {
    setSaving(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from("followup_surveys").insert({
      original_respondent_id: respondentId,
      attended_training: attended === "1",
      practices_applied: practices,
      practice_frequency: practiceFreq ? parseInt(practiceFreq) : null,
      practice_results: results,
      group_progress: groupProgress ? parseInt(groupProgress) : null,
      income_change: incomeChange ? parseInt(incomeChange) : null,
      group_earnings: groupEarnings ? parseInt(groupEarnings) : null,
      low_interest_activities: passions
        .map((p) => (p === "Other" ? otherPassion : p))
        .filter(Boolean),
      lacking_support: lacking,
      g1: gScores.g1 ? parseInt(gScores.g1) : null,
      g2: gScores.g2 ? parseInt(gScores.g2) : null,
      g3: gScores.g3 ? parseInt(gScores.g3) : null,
      g4: gScores.g4 ? parseInt(gScores.g4) : null,
      g5: gScores.g5 ? parseInt(gScores.g5) : null,
      g6: gScores.g6 ? parseInt(gScores.g6) : null,
      improvement_suggestion: g7,
      example_use: g8,
      current_challenges: challenges,
      future_interests: future,
      general_feedback: feedback,
      governance_steps: governance,
      new_markets: newMarkets ? parseInt(newMarkets) : null,
      quality_steps: qualitySteps ? parseInt(qualitySteps) : null,
      conducted_by: user?.id || null,
    })
    if (error) setError(error.message)
    else router.push("/followup")
    setSaving(false)
  }

  if (!respondent) {
    return (
      <div className="p-8">
        <Link href="/followup" className="flex items-center mb-4 text-sm text-blue-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        Loading...
      </div>
    )
  }

  const steps = [
    {
      question: "Did you personally attend the last CWEN training?",
      auto: true,
      render: (next: () => void) => (
        <Select value={attended} onValueChange={(v) => { setAttended(v); next(); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Yes</SelectItem>
            <SelectItem value="0">No</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    ...(attended === "1"
      ? [
          {
            question: "Which CWEN-taught practices have you actually applied?",
            auto: false,
            render: () => (
              <div className="space-y-2">
                {practiceOptions.map((p) => (
                  <label key={p} className="flex items-center space-x-2">
                    <Checkbox checked={practices.includes(p)} onCheckedChange={() => toggle(practices, p, setPractices)} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            ),
          },
          {
            question: "How often do you apply the selected practices?",
            auto: true,
            render: (next: () => void) => (
              <Select value={practiceFreq} onValueChange={(v) => { setPracticeFreq(v); next(); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Never</SelectItem>
                  <SelectItem value="2">Occasionally</SelectItem>
                  <SelectItem value="3">Monthly</SelectItem>
                  <SelectItem value="4">Weekly</SelectItem>
                  <SelectItem value="5">Daily</SelectItem>
                </SelectContent>
              </Select>
            ),
          },
          {
            question: "What tangible result have you seen from those practices?",
            auto: false,
            render: () => (
              <div className="space-y-2">
                {resultOptions.map((p) => (
                  <label key={p} className="flex items-center space-x-2">
                    <Checkbox checked={results.includes(p)} onCheckedChange={() => toggle(results, p, setResults)} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            ),
          },
          {
            question: "Overall, how would you rate your group’s progress since last CWEN visit?",
            auto: true,
            render: (next: () => void) => (
              <Select value={groupProgress} onValueChange={(v) => { setGroupProgress(v); next(); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Very poor</SelectItem>
                  <SelectItem value="2">Poor</SelectItem>
                  <SelectItem value="3">Average</SelectItem>
                  <SelectItem value="4">Good</SelectItem>
                  <SelectItem value="5">Huge progress</SelectItem>
                </SelectContent>
              </Select>
            ),
          },
          {
            question: "Has your personal income changed since last visit?",
            auto: true,
            render: (next: () => void) => (
              <Select value={incomeChange} onValueChange={(v) => { setIncomeChange(v); next(); }}>
                <SelectTrigger className="w-60"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">UGX 0 (no change)</SelectItem>
                  <SelectItem value="1">UGX 50k–100k</SelectItem>
                  <SelectItem value="2">UGX 110k–250k</SelectItem>
                  <SelectItem value="3">UGX 260k–350k</SelectItem>
                  <SelectItem value="4">UGX 360k–500k</SelectItem>
                  <SelectItem value="5">UGX 510k+</SelectItem>
                  <SelectItem value="-1">I’m in debt</SelectItem>
                </SelectContent>
              </Select>
            ),
          },
          {
            question: "Has the group earned money since last visit?",
            auto: true,
            render: (next: () => void) => (
              <Select value={groupEarnings} onValueChange={(v) => { setGroupEarnings(v); next(); }}>
                <SelectTrigger className="w-60"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">UGX 0 (no earnings)</SelectItem>
                  <SelectItem value="1">UGX 1–350k</SelectItem>
                  <SelectItem value="2">UGX 360k–700k</SelectItem>
                  <SelectItem value="3">UGX 710k–1,500k</SelectItem>
                  <SelectItem value="4">UGX 1,510k–3,000k</SelectItem>
                  <SelectItem value="5">UGX 3,010k+</SelectItem>
                  <SelectItem value="-1">Operated at a loss / group debt</SelectItem>
                </SelectContent>
              </Select>
            ),
          },
          {
            question: "In which activities does your group have low passion / low interest?",
            auto: false,
          render: () => (
            <div className="space-y-2">
              {passionOptions.map((p) => (
                <label key={p} className="flex items-center space-x-2">
                  <Checkbox
                    checked={passions.includes(p)}
                    onCheckedChange={(checked) => {
                      toggle(passions, p, setPassions)
                      if (!checked && p === "Other") setOtherPassion("")
                    }}
                  />
                  {p === "Other" ? (
                    <>
                      <span>Other:</span>
                      {passions.includes("Other") && (
                        <Input
                          value={otherPassion}
                          onChange={(e) => setOtherPassion(e.target.value)}
                          placeholder="Specify"
                          className="h-8"
                        />
                      )}
                    </>
                  ) : (
                    <span>{p}</span>
                  )}
                </label>
              ))}
            </div>
          ),
        },
          {
            question: "For the activities you are pursuing, where do you feel you’re still lacking?",
            auto: false,
            render: () => (
              <div className="space-y-2">
                {lackingOptions.map((p) => (
                  <label key={p} className="flex items-center space-x-2">
                    <Checkbox checked={lacking.includes(p)} onCheckedChange={() => toggle(lacking, p, setLacking)} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            ),
          },
          ...mentorQuestions.map((q, idx) => ({
            question: q,
            auto: true,
            render: (next: () => void) => (
              <Select value={(gScores as any)[`g${idx + 1}`]} onValueChange={(v) => { setGScores({ ...gScores, [`g${idx + 1}`]: v }); next(); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Score" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Very poor</SelectItem>
                  <SelectItem value="2">Poor</SelectItem>
                  <SelectItem value="3">Fair</SelectItem>
                  <SelectItem value="4">Good</SelectItem>
                  <SelectItem value="5">Excellent</SelectItem>
                </SelectContent>
              </Select>
            ),
          })),
          {
            question: "What should CWEN do better next time?",
            auto: false,
            render: () => <Textarea value={g7} onChange={(e) => setG7(e.target.value)} />,
          },
          {
            question: "One example of how you used what you learned",
            auto: false,
            render: () => <Textarea value={g8} onChange={(e) => setG8(e.target.value)} />,
          },
          {
            question: "Which challenges are you facing now? (choose top 3)",
            auto: false,
            render: () => (
              <div className="space-y-2">
                {challengeOptions.map((p) => (
                  <label key={p} className="flex items-center space-x-2">
                    <Checkbox checked={challenges.includes(p)} onCheckedChange={() => toggle(challenges, p, setChallenges)} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            ),
          },
          {
            question: "What trainings or ventures would you like CWEN to support next?",
            auto: false,
            render: () => (
              <div className="space-y-2">
                {trainingOptions.map((p) => (
                  <label key={p} className="flex items-center space-x-2">
                    <Checkbox checked={future.includes(p)} onCheckedChange={() => toggle(future, p, setFuture)} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            ),
          },
        ]
      : []),
    {
      question: "Any general feedback for CWEN?",
      auto: false,
      render: () => <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} />,
    },
    ...(attended === "1"
      ? [
          {
            question: "Has your group formalized basic governance this period?",
            auto: false,
            render: () => (
              <div className="space-y-2">
                {governanceOptions.map((p) => (
                  <label key={p} className="flex items-center space-x-2">
                    <Checkbox checked={governance.includes(p)} onCheckedChange={() => toggle(governance, p, setGovernance)} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            ),
          },
          {
            question: "Any new buyers/markets since training?",
            auto: true,
            render: (next: () => void) => (
              <Select value={newMarkets} onValueChange={(v) => { setNewMarkets(v); next(); }}>
                <SelectTrigger className="w-60"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">New local buyers</SelectItem>
                  <SelectItem value="2">New regional buyers</SelectItem>
                </SelectContent>
              </Select>
            ),
          },
          {
            question: "Have you started any quality steps?",
            auto: true,
            render: (next: () => void) => (
              <Select value={qualitySteps} onValueChange={(v) => { setQualitySteps(v); next(); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">In progress</SelectItem>
                  <SelectItem value="2">Completed stage</SelectItem>
                </SelectContent>
              </Select>
            ),
          },
        ]
      : []),
  ]

  const current = steps[step]

  const next = () => {
    if (step === steps.length - 1) {
      handleSubmit()
    } else {
      setStep(step + 1)
    }
  }

  const prev = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="p-8 space-y-6">
      <Link href="/followup" className="flex items-center text-sm text-blue-600">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>
      <h1 className="text-2xl font-bold">Follow-up: {respondent.respondent_name}</h1>
      {error && <div className="text-red-600">{error}</div>}

      <Card className="max-w-2xl mx-auto p-6 space-y-4">
        <div className="font-medium">{current.question}</div>
        {current.render(next)}
        <div className="flex justify-between pt-4">
          {step > 0 && (
            <Button variant="outline" onClick={prev}>
              Back
            </Button>
          )}
          {!current.auto && (
            step === steps.length - 1 ? (
              <Button onClick={handleSubmit} disabled={saving}>
                Submit
              </Button>
            ) : (
              <Button onClick={next}>Next</Button>
            )
          )}
        </div>
      </Card>
    </div>
  )
}
