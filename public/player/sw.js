const CACHE_NAME = "doohplay-media-v1"

self.addEventListener("install", event => {
  self.skipWaiting()
})

self.addEventListener("activate", event => {
  clients.claim()
})

self.addEventListener("fetch", event => {

  const request = event.request

  if(request.method !== "GET") return

  event.respondWith(

    caches.match(request).then(cached => {

      if(cached){
        return cached
      }

      return fetch(request).then(response => {

        const copy = response.clone()

        caches.open(CACHE_NAME).then(cache=>{
          cache.put(request, copy)
        })

        return response

      }).catch(()=>{
        return cached
      })

    })

  )

})