package br.com.doohplay.player

import android.annotation.SuppressLint
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import java.io.*
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val handler = Handler(Looper.getMainLooper())
    private var screenCode = "BARBE332"
    private val API_BASE   = "https://doohplay.com.br"
    private val TAG        = "DOOHPlayer"
    private var pageLoaded = false

    private val retryRunnable = object : Runnable {
        override fun run() {
            if (isOnline()) {
                syncAndLoad()
            } else {
                loadOffline()
                handler.postDelayed(this, 30_000)
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_FULLSCREEN or
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        )

        intent.getStringExtra("screen")?.let { screenCode = it }

        val container = FrameLayout(this)
        container.setBackgroundColor(android.graphics.Color.BLACK)
        setContentView(container)

        webView = WebView(this)
        container.addView(webView, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ))

        webView.settings.apply {
            javaScriptEnabled                = true
            domStorageEnabled                = true
            databaseEnabled                  = true
            mediaPlaybackRequiresUserGesture = false
            loadWithOverviewMode             = true
            useWideViewPort                  = true
            setSupportZoom(false)
            builtInZoomControls              = false
            displayZoomControls              = false
            allowFileAccess                  = true
            allowContentAccess               = true
            // ✅ FIX: permite carregar imagens de qualquer origem
            blockNetworkImage                = false
            loadsImagesAutomatically         = true
            cacheMode                        = WebSettings.LOAD_NO_CACHE
            mixedContentMode                 = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            // ✅ FIX: user agent normal de browser para não ser bloqueado
            userAgentString                  = "Mozilla/5.0 (Linux; Android 10; TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        // ✅ FIX: aceita todos os certificados SSL (para R2 e CDN)
        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) {
                    Log.w(TAG, "Page error: ${error.description} | url: ${request.url}")
                    handler.postDelayed({ loadOffline() }, 3_000)
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                pageLoaded = true
                Log.d(TAG, "Page loaded: $url")
                // ✅ FIX: NÃO injeta overflow hidden — deixa o player controlar o próprio layout
            }

            override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: android.net.http.SslError) {
                // Aceita SSL de CDNs
                handler.proceed()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(msg: ConsoleMessage): Boolean {
                Log.d(TAG, "JS [${msg.messageLevel()}]: ${msg.message()} @ ${msg.sourceId()}:${msg.lineNumber()}")
                return true
            }
        }

        webView.addJavascriptInterface(PlayerInterface(), "AndroidPlayer")

        if (isOnline()) {
            syncAndLoad()
        } else {
            loadOffline()
            handler.post(retryRunnable)
        }

        // Heartbeat a cada 30s
        handler.postDelayed(object : Runnable {
            override fun run() {
                sendHeartbeat()
                handler.postDelayed(this, 30_000)
            }
        }, 30_000)
    }

    private fun syncAndLoad() {
        val onlineUrl = "$API_BASE/player?screen=$screenCode"
        Log.d(TAG, "Loading: $onlineUrl")
        webView.loadUrl(onlineUrl)

        Thread {
            try {
                syncMediaCache()
            } catch (e: Exception) {
                Log.e(TAG, "Sync error: ${e.message}")
            }
        }.start()
    }

    private fun loadOffline() {
        val cacheDir  = File(filesDir, "media_cache/$screenCode")
        val indexFile = File(cacheDir, "index.json")

        if (!indexFile.exists()) {
            loadWaitScreen()
            return
        }

        try {
            val index  = JSONArray(indexFile.readText())
            val medias = mutableListOf<Map<String, String>>()

            for (i in 0 until index.length()) {
                val item      = index.getJSONObject(i)
                val localFile = File(cacheDir, item.getString("filename"))
                if (localFile.exists()) {
                    medias.add(mapOf(
                        "type"     to item.getString("type"),
                        "url"      to "file://${localFile.absolutePath}",
                        "name"     to item.optString("name", ""),
                        "duration" to item.optString("duration", "15")
                    ))
                }
            }

            if (medias.isEmpty()) {
                loadWaitScreen()
                return
            }

            val html = buildOfflineHtml(medias)
            webView.loadDataWithBaseURL(
                "file://${filesDir.absolutePath}/",
                html, "text/html", "UTF-8", null
            )
        } catch (e: Exception) {
            Log.e(TAG, "Offline load error: ${e.message}")
            loadWaitScreen()
        }
    }

    private fun syncMediaCache() {
        val apiUrl = URL("$API_BASE/api/client/playlist/$screenCode")
        val conn   = apiUrl.openConnection() as HttpURLConnection
        conn.connectTimeout = 10_000
        conn.readTimeout    = 15_000

        val response = conn.inputStream.bufferedReader().readText()
        conn.disconnect()

        val json  = org.json.JSONObject(response)
        val items = json.getJSONArray("items")

        val cacheDir = File(filesDir, "media_cache/$screenCode")
        cacheDir.mkdirs()

        val index = JSONArray()

        for (i in 0 until items.length()) {
            val item   = items.getJSONObject(i)
            val url    = item.optString("asset_url")
            val type   = item.optString("type", "image")
            val name   = item.optString("name", "media_$i")
            val dur    = item.optInt("duration", 15)
            val active = item.optBoolean("active", true)

            if (!active || url.isBlank()) continue

            val ext = when {
                type == "video"       -> "mp4"
                url.endsWith(".webp") -> "webp"
                url.endsWith(".png")  -> "png"
                url.endsWith(".gif")  -> "gif"
                else                  -> "jpg"
            }

            val filename  = "media_$i.$ext"
            val localFile = File(cacheDir, filename)

            try {
                val mediaConn = URL(url).openConnection() as HttpURLConnection
                mediaConn.connectTimeout = 15_000
                mediaConn.readTimeout    = 60_000
                val bytes = mediaConn.inputStream.readBytes()
                mediaConn.disconnect()
                localFile.writeBytes(bytes)
                Log.d(TAG, "Cached: $filename (${bytes.size / 1024}KB)")

                val indexItem = org.json.JSONObject()
                indexItem.put("filename", filename)
                indexItem.put("type",     type)
                indexItem.put("name",     name)
                indexItem.put("duration", dur.toString())
                index.put(indexItem)

            } catch (e: Exception) {
                Log.e(TAG, "Download failed $filename: ${e.message}")
            }
        }

        File(cacheDir, "index.json").writeText(index.toString())
        Log.d(TAG, "Cache sync: ${index.length()} files")
    }

    private fun buildOfflineHtml(medias: List<Map<String, String>>): String {
        val slides = medias.mapIndexed { i, m ->
            val active  = if (i == 0) " active" else ""
            val content = if (m["type"] == "video") {
                """<video src="${m["url"]}" autoplay muted playsinline></video>"""
            } else {
                """<img src="${m["url"]}" alt="${m["name"]}">"""
            }
            """<div class="slide$active" data-duration="${m["duration"]}">$content</div>"""
        }.joinToString("\n")

        return """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:100vw; height:100vh; background:#000; overflow:hidden; }
.slide { position:absolute; inset:0; display:none; align-items:center; justify-content:center; }
.slide.active { display:flex; }
.slide img, .slide video { width:100%; height:100%; object-fit:cover; }
#bar { position:fixed; bottom:0; left:0; height:3px; background:#3B82F6; width:0%; }
#tag { position:fixed; top:8px; right:8px; font-size:10px; color:#94A3B8;
  background:rgba(0,0,0,0.6); padding:3px 8px; border-radius:10px; font-family:sans-serif; }
</style></head><body>
<div id="bar"></div>
<div id="tag">📴 Offline</div>
$slides
<script>
var cur=0, slides=document.querySelectorAll('.slide'), bar=document.getElementById('bar');
function show(i){
  slides.forEach(function(s){s.classList.remove('active');});
  var s=slides[i]; if(!s)return;
  s.classList.add('active');
  var dur=parseInt(s.getAttribute('data-duration')||'15')*1000;
  var vid=s.querySelector('video');
  if(bar){bar.style.transition='none';bar.style.width='0%';
    setTimeout(function(){bar.style.transition='width '+dur+'ms linear';bar.style.width='100%';},50);}
  if(vid){vid.currentTime=0;vid.play();vid.onended=next;}
  else{setTimeout(next,dur);}
}
function next(){cur=(cur+1)%slides.length;show(cur);}
show(0);
setInterval(function(){if(typeof AndroidPlayer!=='undefined')AndroidPlayer.checkOnline();},30000);
</script></body></html>"""
    }

    private fun loadWaitScreen() {
        webView.loadData("""<!DOCTYPE html><html><body style="margin:0;background:#0F172A;
display:flex;flex-direction:column;align-items:center;justify-content:center;
height:100vh;font-family:sans-serif;color:#F1F5F9;">
<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" style="margin-bottom:20px">
<rect x="2" y="3" width="20" height="14" rx="2"/>
<line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
</svg>
<div style="font-size:32px;font-weight:900;">DOOH<span style="color:#3B82F6">PLAY</span></div>
<div style="font-size:14px;color:#64748B;margin-top:12px;">Aguardando conexão...</div>
<div style="font-size:12px;color:#374151;margin-top:8px;">$screenCode</div>
</body></html>""", "text/html", "UTF-8")
    }

    private fun sendHeartbeat() {
        Thread {
            try {
                val conn = URL("$API_BASE/api/player/heartbeat").openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 5_000
                conn.readTimeout    = 5_000
                conn.outputStream.write("""{"code":"$screenCode"}""".toByteArray())
                conn.responseCode
                conn.disconnect()
            } catch (e: Exception) {
                Log.d(TAG, "Heartbeat failed: ${e.message}")
            }
        }.start()
    }

    inner class PlayerInterface {
        @JavascriptInterface
        fun checkOnline(): Boolean {
            if (isOnline()) {
                handler.post { syncAndLoad() }
                return true
            }
            return false
        }
    }

    private fun isOnline(): Boolean {
        val cm      = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val caps    = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK) return true
        return super.onKeyDown(keyCode, event)
    }

    // ✅ FIX: onResume NÃO recarrega se já carregou — evita loop
    override fun onResume() {
        super.onResume()
        if (!pageLoaded) {
            if (isOnline()) syncAndLoad() else { loadOffline(); handler.post(retryRunnable) }
        }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        webView.destroy()
        super.onDestroy()
    }
}
