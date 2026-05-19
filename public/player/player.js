const SCREEN_ID = "9fd8027a-8b1d-4dd9-970d-03a86c9af534"
const API = "http://localhost:3000"

let playlist = []
let index = 0
let timeout = null
let watchdog = Date.now()

//------------------------------------------------
// UTIL
//------------------------------------------------

function safeNext(){
  setTimeout(next, 100)
}

function fetchTimeout(url, options={}, timeout=5000){

  const controller = new AbortController()
  const id = setTimeout(()=>controller.abort(), timeout)

  return fetch(url,{...options,signal:controller.signal})
    .finally(()=>clearTimeout(id))

}

//------------------------------------------------
// LOAD PLAYLIST
//------------------------------------------------

async function loadPlaylist(){

  try{

    const res = await fetchTimeout(
      `${API}/api/player/playlist?screen=${SCREEN_ID}`
    )

    if(!res.ok){
      console.log("playlist error")
      return
    }

    const data = await res.json()

    const items = data.items || []

    if(Array.isArray(items)){
      playlist = items
    }

    if(index >= playlist.length){
      index = 0
    }

    console.log("playlist loaded:", playlist.length)

  }catch(e){

    console.log("playlist failed", e)

  }

}

//------------------------------------------------
// HEARTBEAT
//------------------------------------------------

async function sendHeartbeat(){

  try{

    await fetchTimeout(`${API}/api/player/heartbeat`,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        screen_id:SCREEN_ID,
        version:"1.0.0"
      })

    },3000)

  }catch(e){

    console.log("heartbeat failed")

  }

}

//------------------------------------------------
// PROOF EVENT
//------------------------------------------------

async function sendProof(asset){

  if(!asset) return

  try{

    await fetchTimeout(`${API}/api/events/display`,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        screen_id:SCREEN_ID,
        asset_url:asset,
        timestamp:new Date().toISOString()
      })

    },3000)

  }catch(e){

    console.log("proof failed")

  }

}

//------------------------------------------------
// CLEAR PLAYER
//------------------------------------------------

function clearPlayer(){

  const player = document.getElementById("player")

  if(!player) return

  const videos = player.querySelectorAll("video")

  videos.forEach(v=>{
    v.pause()
    v.removeAttribute("src")
    v.load()
  })

  player.replaceChildren()

}

//------------------------------------------------
// SHOW MEDIA
//------------------------------------------------

function showMedia(item){

  const player = document.getElementById("player")

  if(!player){
    safeNext()
    return
  }

  if(!item || !item.url){
    console.log("invalid media")
    safeNext()
    return
  }

  clearPlayer()

  watchdog = Date.now()

  //------------------------------------------------
  // VIDEO
  //------------------------------------------------

  if(item.type === "video"){

    const video = document.createElement("video")

    video.src = item.url
    video.autoplay = true
    video.muted = true
    video.playsInline = true
    video.preload = "auto"

    video.onended = next

    video.onerror = ()=>{
      console.log("video error")
      safeNext()
    }

    player.appendChild(video)

  }

  //------------------------------------------------
  // IMAGE
  //------------------------------------------------

  else{

    const img = document.createElement("img")

    img.src = item.url
    img.loading = "eager"

    img.onerror = ()=>{
      console.log("image error")
      safeNext()
    }

    player.appendChild(img)

    const duration = Math.max(item.duration || 10, 3)

    timeout = setTimeout(next, duration * 1000)

  }

  sendProof(item.url)

}

//------------------------------------------------
// NEXT MEDIA
//------------------------------------------------

function next(){

  if(timeout){
    clearTimeout(timeout)
    timeout = null
  }

  if(!playlist.length){

    console.log("playlist empty")

    timeout = setTimeout(next,5000)

    return

  }

  if(index >= playlist.length){
    index = 0
  }

  const item = playlist[index]

  index++

  showMedia(item)

}

//------------------------------------------------
// WATCHDOG
//------------------------------------------------

setInterval(()=>{

  const diff = Date.now() - watchdog

  if(diff > 120000){

    console.log("player restart")

    location.reload()

  }

},30000)

//------------------------------------------------
// START PLAYER
//------------------------------------------------

async function start(){

  console.log("DOOHPLAY PLAYER START")

  await loadPlaylist()

  next()

  setInterval(sendHeartbeat,30000)

  setInterval(loadPlaylist,60000)

}

start()