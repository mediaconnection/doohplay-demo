"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SearchBar() {
  const [value, setValue] = useState("")
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    if (!value) return

    router.push(`/explorer?q=${value}`)
  }

  return (
    <form onSubmit={handleSearch} className="mb-6 flex gap-2">

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by hash..."
        className="border p-2 w-full rounded"
      />

      <button
        type="submit"
        className="bg-black text-white px-4 rounded"
      >
        Search
      </button>

    </form>
  )
}