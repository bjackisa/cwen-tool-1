"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { normalize, toTitleCase } from "@/lib/utils"

interface Group { id: string; name: string; district_id: string | null }
interface District { id: string; name: string }

export default function GroupsPage() {
  const supabase = createClient()
  const [groups, setGroups] = useState<Group[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [newName, setNewName] = useState("")
  const [newDistrict, setNewDistrict] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    const { data: g } = await supabase.from("groups").select("*").order("name")
    const { data: d } = await supabase.from("districts").select("*").order("name")
    setGroups((g || []).map((gr) => ({ ...gr, name: toTitleCase(gr.name) })) as Group[])
    setDistricts((d || []).map((dist) => ({ ...dist, name: toTitleCase(dist.name) })) as District[])
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    const value = toTitleCase(newName)
    const { error } = await supabase.from("groups").insert({ name: normalize(value), district_id: newDistrict })
    if (error) setError(error.message)
    else {
      setNewName("")
      setNewDistrict(null)
      load()
    }
  }

  const update = async (id: string, name: string, district_id: string | null) => {
    const value = toTitleCase(name)
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name: value, district_id } : g)))
    const { error } = await supabase.from("groups").update({ name: normalize(value), district_id }).eq("id", id)
    if (error) setError(error.message)
  }

  const remove = async (id: string) => {
    if (!confirm("Delete group?")) return
    const { error } = await supabase.from("groups").delete().eq("id", id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Groups</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex space-x-2 items-center">
        <Input value={newName} onChange={(e) => setNewName(toTitleCase(e.target.value))} placeholder="Group name" />
        <Select onValueChange={setNewDistrict} value={newDistrict || ""}>
          <SelectTrigger className="w-40"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={add} disabled={!newName.trim()}>Add</Button>
      </div>
      <ul className="space-y-2">
        {groups.map((g) => (
          <li key={g.id} className="flex items-center space-x-2">
            <Input
              value={g.name}
              onChange={(e) => update(g.id, e.target.value, g.district_id)}
            />
            <Select
              value={g.district_id || ""}
              onValueChange={(val) => update(g.id, g.name, val || null)}
            >
              <SelectTrigger className="w-40"><SelectValue placeholder="District" /></SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="destructive" onClick={() => remove(g.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
