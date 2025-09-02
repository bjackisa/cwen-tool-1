"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Location { id: string; district_id: string | null; sub_county: string; parish: string }
interface District { id: string; name: string }

export default function LocationsPage() {
  const supabase = createClient()
  const [locations, setLocations] = useState<Location[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [form, setForm] = useState({ district: "", sub_county: "", parish: "" })
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    const { data: locs } = await supabase.from("locations").select("*").order("sub_county")
    const { data: dists } = await supabase.from("districts").select("*").order("name")
    setLocations((locs || []) as Location[])
    setDistricts((dists || []) as District[])
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    const { error } = await supabase.from("locations").insert({ district_id: form.district || null, sub_county: form.sub_county, parish: form.parish })
    if (error) setError(error.message)
    else { setForm({ district: "", sub_county: "", parish: "" }); load() }
  }

  const update = async (loc: Location) => {
    const { error } = await supabase.from("locations").update({ district_id: loc.district_id, sub_county: loc.sub_county, parish: loc.parish }).eq("id", loc.id)
    if (error) setError(error.message)
  }

  const remove = async (id: string) => {
    if (!confirm("Delete location?")) return
    const { error } = await supabase.from("locations").delete().eq("id", id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Locations</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={form.sub_county} onChange={(e) => setForm({ ...form, sub_county: e.target.value })} placeholder="Sub county" />
        <Input value={form.parish} onChange={(e) => setForm({ ...form, parish: e.target.value })} placeholder="Parish" />
        <Button onClick={add} disabled={!form.sub_county || !form.parish}>Add</Button>
      </div>
      <ul className="space-y-2">
        {locations.map((loc) => (
          <li key={loc.id} className="flex flex-wrap gap-2 items-center">
            <Select value={loc.district_id || ""} onValueChange={(v) => { loc.district_id = v; update(loc) }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="District" /></SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={loc.sub_county} onChange={(e) => { loc.sub_county = e.target.value; update(loc) }} />
            <Input value={loc.parish} onChange={(e) => { loc.parish = e.target.value; update(loc) }} />
            <Button variant="destructive" onClick={() => remove(loc.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
