"use client"

import { useEffect, useState } from "react"

export default function AudiencePage() {

  const [data,setData] = useState<any>(null)

  useEffect(()=>{

    fetch("/api/audience/campaign/demo")
      .then(r=>r.json())
      .then(setData)

  },[])

  if(!data) return <div>Loading...</div>

  return (

    <div style={{padding:40}}>

      <h1>Audience Intelligence</h1>

      <div style={{marginTop:30}}>

        <h2>Reach</h2>
        <p>{data.reach}</p>

        <h2>Average Attention</h2>
        <p>{Number(data.avg_attention).toFixed(2)}</p>

        <h2>Average Dwell</h2>
        <p>{Number(data.avg_dwell).toFixed(2)}s</p>

        <h2>Audience Events</h2>
        <p>{data.events}</p>

      </div>

    </div>
  )
}