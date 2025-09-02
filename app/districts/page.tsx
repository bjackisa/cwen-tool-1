"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface District { id: string; name: string }

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([])
  const [newName, setNewName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const load = async () => {
    const { data, error } = await supabase.from("districts").select("*").order("name")
    if (error) setError(error.message)
    else setDistricts(data as District[])
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    const { error } = await supabase.from("districts").insert({ name: newName })
    if (error) setError(error.message)
    else { setNewName(""); load() }
  }

  const update = async (id: string, name: string) => {
    const { error } = await supabase.from("districts").update({ name }).eq("id", id)
    if (error) setError(error.message)
  }

  const remove = async (id: string) => {
    if (!confirm("Delete district?")) return
    const { error } = await supabase.from("districts").delete().eq("id", id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Districts</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex space-x-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New district" />
        <Button onClick={add} disabled={!newName.trim()}>Add</Button>
      </div>
      <ul className="space-y-2">
        {districts.map((d) => (
          <li key={d.id} className="flex items-center space-x-2">
            <Input value={d.name} onChange={(e) => update(d.id, e.target.value)} />
            <Button variant="destructive" onClick={() => remove(d.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
