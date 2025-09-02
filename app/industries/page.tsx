"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Industry {
  id: string
  name: string
}

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [newName, setNewName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const loadIndustries = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("industries").select("*").order("name")
    if (error) setError(error.message)
    else setIndustries(data as Industry[])
  }

  useEffect(() => {
    loadIndustries()
  }, [])

  const addIndustry = async () => {
    const supabase = createClient()
    const { error } = await supabase.from("industries").insert({ name: newName })
    if (error) setError(error.message)
    else {
      setNewName("")
      loadIndustries()
    }
  }

  const updateIndustry = async (id: string, name: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("industries").update({ name }).eq("id", id)
    if (error) setError(error.message)
    else loadIndustries()
  }

  const deleteIndustry = async (id: string) => {
    if (!confirm("Delete this industry?")) return
    const supabase = createClient()
    const { error } = await supabase.from("industries").delete().eq("id", id)
    if (error) setError(error.message)
    else loadIndustries()
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Industries</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex space-x-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New industry" />
        <Button onClick={addIndustry} disabled={!newName.trim()}>Add</Button>
      </div>
      <ul className="space-y-2">
        {industries.map((ind) => (
          <li key={ind.id} className="flex items-center space-x-2">
            <Input
              value={ind.name}
              onChange={(e) => updateIndustry(ind.id, e.target.value)}
            />
            <Button variant="destructive" onClick={() => deleteIndustry(ind.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
