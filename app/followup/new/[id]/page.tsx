"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  "Savings/VSLA discipline",
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
  "Bank/VSLA account",
  "Basic financial records",
  "None",
]

export default function NewFollowupPage() {
  const params = useParams()
  const router = useRouter()
  const respondentId = params.id as string

  const [respondent, setRespondent] = useState<Respondent | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [attended, setAttended] = useState("1")
  const [practices, setPractices] = useState<string[]>([])
  const [practiceFreq, setPracticeFreq] = useState("")
  const [results, setResults] = useState<string[]>([])
  const [groupProgress, setGroupProgress] = useState("")
  const [incomeChange, setIncomeChange] = useState("")
  const [groupEarnings, setGroupEarnings] = useState("")
  const [passions, setPassions] = useState<string[]>([])
  const [lacking, setLacking] = useState<string[]>([])
  const [gScores, setGScores] = useState({ g1: "", g2: "", g3: "", g4: "", g5: "", g6: "" })
  const [g7, setG7] = useState("")
  const [g8, setG8] = useState("")
  const [challenges, setChallenges] = useState<string[]>([])
  const [future, setFuture] = useState<string[]>([])
  const [feedback, setFeedback] = useState("")
  const [governance, setGovernance] = useState<string[]>([])
  const [members, setMembers] = useState({ active: "", women: "", youth: "" })
  const [newMarkets, setNewMarkets] = useState("")
  const [qualitySteps, setQualitySteps] = useState("")
  const [savingsGroup, setSavingsGroup] = useState("0")

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
      low_interest_activities: passions,
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
      active_members: members.active ? parseInt(members.active) : null,
      women_members: members.women ? parseInt(members.women) : null,
      youth_members: members.youth ? parseInt(members.youth) : null,
      new_markets: newMarkets ? parseInt(newMarkets) : null,
      quality_steps: qualitySteps ? parseInt(qualitySteps) : null,
      savings_group: savingsGroup === "1",
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

  return (
    <div className="p-8 space-y-6">
      <Link href="/followup" className="flex items-center text-sm text-blue-600">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>
      <h1 className="text-2xl font-bold">Follow-up: {respondent.respondent_name}</h1>
      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-4">
        <div>
          <div className="font-medium mb-2">Did you personally attend the last CWEN training?</div>
          <Select value={attended} onValueChange={setAttended}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Yes</SelectItem>
              <SelectItem value="0">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {attended === "1" && (
          <>
            <div>
              <div className="font-medium mb-2">Which CWEN-taught practices have you actually applied?</div>
              {practiceOptions.map((p) => (
                <label key={p} className="flex items-center space-x-2">
                  <Checkbox checked={practices.includes(p)} onCheckedChange={() => toggle(practices, p, setPractices)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>

            <div>
              <div className="font-medium mb-2">How often do you apply the selected practices?</div>
              <Select value={practiceFreq} onValueChange={setPracticeFreq}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Never</SelectItem>
                  <SelectItem value="2">Occasionally</SelectItem>
                  <SelectItem value="3">Monthly</SelectItem>
                  <SelectItem value="4">Weekly</SelectItem>
                  <SelectItem value="5">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="font-medium mb-2">What tangible result have you seen from those practices?</div>
              {resultOptions.map((p) => (
                <label key={p} className="flex items-center space-x-2">
                  <Checkbox checked={results.includes(p)} onCheckedChange={() => toggle(results, p, setResults)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>

            <div>
              <div className="font-medium mb-2">Overall, how would you rate your group’s progress since last CWEN visit?</div>
              <Select value={groupProgress} onValueChange={setGroupProgress}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Very poor</SelectItem>
                  <SelectItem value="2">Poor</SelectItem>
                  <SelectItem value="3">Average</SelectItem>
                  <SelectItem value="4">Good</SelectItem>
                  <SelectItem value="5">Huge progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="font-medium mb-2">Has your personal income changed since last visit?</div>
              <Select value={incomeChange} onValueChange={setIncomeChange}>
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
            </div>

            <div>
              <div className="font-medium mb-2">Has the group earned money since last visit?</div>
              <Select value={groupEarnings} onValueChange={setGroupEarnings}>
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
            </div>

            <div>
              <div className="font-medium mb-2">In which activities does your group have low passion / low interest?</div>
              {passionOptions.map((p) => (
                <label key={p} className="flex items-center space-x-2">
                  <Checkbox checked={passions.includes(p)} onCheckedChange={() => toggle(passions, p, setPassions)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>

            <div>
              <div className="font-medium mb-2">For the activities you are pursuing, where do you feel you’re still lacking?</div>
              {lackingOptions.map((p) => (
                <label key={p} className="flex items-center space-x-2">
                  <Checkbox checked={lacking.includes(p)} onCheckedChange={() => toggle(lacking, p, setLacking)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>

            <div>
              <div className="font-medium mb-2">Mentor & Training Evaluation</div>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="flex items-center space-x-2">
                  <span className="w-8">G{n}</span>
                  <Select value={(gScores as any)[`g${n}`]} onValueChange={(v) => setGScores({ ...gScores, [`g${n}`]: v })}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Score" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Very poor</SelectItem>
                      <SelectItem value="2">Poor</SelectItem>
                      <SelectItem value="3">Fair</SelectItem>
                      <SelectItem value="4">Good</SelectItem>
                      <SelectItem value="5">Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div>
              <div className="font-medium mb-1">What should CWEN do better next time?</div>
              <Textarea value={g7} onChange={(e) => setG7(e.target.value)} />
            </div>

            <div>
              <div className="font-medium mb-1">One example of how you used what you learned</div>
              <Textarea value={g8} onChange={(e) => setG8(e.target.value)} />
            </div>

            <div>
              <div className="font-medium mb-2">Which challenges are you facing now? (choose top 3)</div>
              {challengeOptions.map((p) => (
                <label key={p} className="flex items-center space-x-2">
                  <Checkbox checked={challenges.includes(p)} onCheckedChange={() => toggle(challenges, p, setChallenges)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>

            <div>
              <div className="font-medium mb-2">What trainings or ventures would you like CWEN to support next?</div>
              {trainingOptions.map((p) => (
                <label key={p} className="flex items-center space-x-2">
                  <Checkbox checked={future.includes(p)} onCheckedChange={() => toggle(future, p, setFuture)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </>
        )}

        <div>
          <div className="font-medium mb-1">Any general feedback for CWEN?</div>
          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </div>

        {attended === "1" && (
          <>
            <div>
              <div className="font-medium mb-2">Has your group formalized basic governance this period?</div>
              {governanceOptions.map((p) => (
                <label key={p} className="flex items-center space-x-2">
                  <Checkbox checked={governance.includes(p)} onCheckedChange={() => toggle(governance, p, setGovernance)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Active members" value={members.active} onChange={(e) => setMembers({ ...members, active: e.target.value })} />
              <Input type="number" placeholder="Women" value={members.women} onChange={(e) => setMembers({ ...members, women: e.target.value })} />
              <Input type="number" placeholder="Youth" value={members.youth} onChange={(e) => setMembers({ ...members, youth: e.target.value })} />
            </div>

            <div>
              <div className="font-medium mb-2">Any new buyers/markets since training?</div>
              <Select value={newMarkets} onValueChange={setNewMarkets}>
                <SelectTrigger className="w-60"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">New local buyers</SelectItem>
                  <SelectItem value="2">New regional buyers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="font-medium mb-2">Have you started any quality steps?</div>
              <Select value={qualitySteps} onValueChange={setQualitySteps}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">In progress</SelectItem>
                  <SelectItem value="2">Completed stage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="font-medium mb-2">Do you belong to a savings group (VSLA/SACCO)?</div>
              <Select value={savingsGroup} onValueChange={setSavingsGroup}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Yes</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={saving}>Submit</Button>
    </div>
  )
}

