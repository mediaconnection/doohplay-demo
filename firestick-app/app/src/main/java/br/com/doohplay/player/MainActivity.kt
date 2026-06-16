package br.com.doohplay.player

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
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
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import java.io.*
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var prefs: SharedPreferences
    private val handler = Handler(Looper.getMainLooper())
    private var screenCode = ""
    private val API_BASE   = "https://doohplay.com.br"
    private val TAG        = "DOOHPlayer"
    private var pageLoaded = false

    private val retryRunnable = object : Runnable {
        override fun run() {
            if (isOnline()) syncAndLoad()
            else { loadOffline(); handler.postDelayed(this, 30_000) }
        }
    }

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

        prefs = getSharedPreferences("doohplay", Context.MODE_PRIVATE)
        screenCode = prefs.getString("screen_code", "") ?: ""

        // Se não tem código salvo, mostra tela de ativação
        if (screenCode.isBlank()) {
            showActivationScreen()
        } else {
            startPlayer()
        }
    }

    // ── Tela de ativação ──────────────────────────────────────────────────────
    private fun showActivationScreen() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setBackgroundColor(android.graphics.Color.parseColor("#0F172A"))
            setPadding(80, 60, 80, 60)
        }

        // Logo text
        val logoText = TextView(this).apply {
            text = "DOOHPLAY"
            textSize = 36f
            setTextColor(android.graphics.Color.WHITE)
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            gravity = android.view.Gravity.CENTER
        }
        root.addView(logoText)

        // Subtitle
        val subtitle = TextView(this).apply {
            text = "Digite o código da sua tela"
            textSize = 16f
            setTextColor(android.graphics.Color.parseColor("#94A3B8"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 24, 0, 40)
        }
        root.addView(subtitle)

        // Input de código
        val input = EditText(this).apply {
            hint = "Ex: BARBE332"
            textSize = 24f
            setTextColor(android.graphics.Color.WHITE)
            setHintTextColor(android.graphics.Color.parseColor("#475569"))
            setBackgroundColor(android.graphics.Color.parseColor("#1E293B"))
            setPadding(32, 24, 32, 24)
            inputType = android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS
            gravity = android.view.Gravity.CENTER
            maxLines = 1
        }
        val inputParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { bottomMargin = 24 }
        root.addView(input, inputParams)

        // Status text (erros/sucesso)
        val statusText = TextView(this).apply {
            text = ""
            textSize = 13f
            setTextColor(android.graphics.Color.parseColor("#EF4444"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 16)
        }
        root.addView(statusText)

        // Botão ativar
        val btnAtivar = Button(this).apply {
            text = "ATIVAR"
            textSize = 16f
            setTextColor(android.graphics.Color.WHITE)
            setBackgroundColor(android.graphics.Color.parseColor("#3B82F6"))
            setPadding(48, 24, 48, 24)
        }
        val btnParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        root.addView(btnAtivar, btnParams)

        // Hint
        val hint = TextView(this).apply {
            text = "O código foi enviado por WhatsApp ou email"
            textSize = 12f
            setTextColor(android.graphics.Color.parseColor("#475569"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 20, 0, 0)
        }
        root.addView(hint)

        setContentView(root)

        btnAtivar.setOnClickListener {
            val code = input.text.toString().trim().uppercase()
            if (code.isBlank()) {
                statusText.text = "Digite o código da sua tela"
                return@setOnClickListener
            }
            statusText.setTextColor(android.graphics.Color.parseColor("#64748B"))
            statusText.text = "Verificando código..."
            btnAtivar.isEnabled = false

            Thread {
                val valid = validateCode(code)
                handler.post {
                    if (valid) {
                        prefs.edit().putString("screen_code", code).apply()
                        screenCode = code
                        statusText.setTextColor(android.graphics.Color.parseColor("#22C55E"))
                        statusText.text = "✓ Código válido! Iniciando..."
                        handler.postDelayed({ startPlayer() }, 1_000)
                    } else {
                        statusText.setTextColor(android.graphics.Color.parseColor("#EF4444"))
                        statusText.text = "Código inválido. Verifique e tente novamente."
                        btnAtivar.isEnabled = true
                    }
                }
            }.start()
        }
    }

    // ── Valida código no servidor ─────────────────────────────────────────────
    private fun validateCode(code: String): Boolean {
        return try {
            val url  = URL("$API_BASE/api/client/validate?code=$code")
            val conn = url.openConnection() as HttpURLConnection
            conn.connectTimeout = 8_000
            conn.readTimeout    = 8_000
            val response = conn.inputStream.bufferedReader().readText()
            conn.disconnect()
            val json = org.json.JSONObject(response)
            json.optBoolean("valid", false)
        } catch (e: Exception) {
            Log.e(TAG, "Validate error: ${e.message}")
            false
        }
    }

    // ── Inicia player ─────────────────────────────────────────────────────────
    @SuppressLint("SetJavaScriptEnabled")
    private fun startPlayer() {
        val container = android.widget.FrameLayout(this).apply {
            setBackgroundColor(android.graphics.Color.BLACK)
        }
        setContentView(container)

        webView = WebView(this)
        container.addView(webView, android.widget.FrameLayout.LayoutParams(
            android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
            android.widget.FrameLayout.LayoutParams.MATCH_PARENT
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
            blockNetworkImage                = false
            loadsImagesAutomatically         = true
            cacheMode                        = WebSettings.LOAD_NO_CACHE
            mixedContentMode                 = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            userAgentString                  = "Mozilla/5.0 (Linux; Android 10; TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) {
                    Log.w(TAG, "Page error: ${error.description}")
                    handler.postDelayed({ loadOffline() }, 3_000)
                }
            }
            override fun onPageFinished(view: WebView, url: String) {
                pageLoaded = true
                Log.d(TAG, "Page loaded: $url")
            }
            override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: android.net.http.SslError) {
                handler.proceed()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(msg: ConsoleMessage): Boolean {
                Log.d(TAG, "JS: ${msg.message()}")
                return true
            }
        }

        webView.addJavascriptInterface(PlayerInterface(), "AndroidPlayer")

        if (isOnline()) syncAndLoad()
        else { loadOffline(); handler.post(retryRunnable) }

        // Heartbeat a cada 30s
        handler.postDelayed(object : Runnable {
            override fun run() {
                sendHeartbeat()
                handler.postDelayed(this, 30_000)
            }
        }, 30_000)
    }

    // ── Player online ─────────────────────────────────────────────────────────
    private fun syncAndLoad() {
        val url = "$API_BASE/player?screen=$screenCode"
        Log.d(TAG, "Loading: $url")
        webView.loadUrl(url)

        Thread {
            try { syncMediaCache() }
            catch (e: Exception) { Log.e(TAG, "Sync error: ${e.message}") }
        }.start()
    }

    // ── Player offline ────────────────────────────────────────────────────────
    private fun loadOffline() {
        val cacheDir  = File(filesDir, "media_cache/$screenCode")
        val indexFile = File(cacheDir, "index.json")

        if (!indexFile.exists()) { loadWaitScreen(); return }

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

            if (medias.isEmpty()) { loadWaitScreen(); return }

            webView.loadDataWithBaseURL(
                "file://${filesDir.absolutePath}/",
                buildOfflineHtml(medias), "text/html", "UTF-8", null
            )
        } catch (e: Exception) {
            Log.e(TAG, "Offline load error: ${e.message}")
            loadWaitScreen()
        }
    }

    // ── Sincroniza cache ──────────────────────────────────────────────────────
    private fun syncMediaCache() {
        val conn = URL("$API_BASE/api/client/playlist/$screenCode").openConnection() as HttpURLConnection
        conn.connectTimeout = 10_000
        conn.readTimeout    = 15_000
        val response = conn.inputStream.bufferedReader().readText()
        conn.disconnect()

        val items    = org.json.JSONObject(response).getJSONArray("items")
        val cacheDir = File(filesDir, "media_cache/$screenCode").also { it.mkdirs() }
        val index    = JSONArray()

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
                val mc = URL(url).openConnection() as HttpURLConnection
                mc.connectTimeout = 15_000
                mc.readTimeout    = 60_000
                val bytes = mc.inputStream.readBytes()
                mc.disconnect()
                localFile.writeBytes(bytes)

                val idx = org.json.JSONObject()
                idx.put("filename", filename)
                idx.put("type",     type)
                idx.put("name",     name)
                idx.put("duration", dur.toString())
                index.put(idx)
                Log.d(TAG, "Cached: $filename (${bytes.size / 1024}KB)")
            } catch (e: Exception) {
                Log.e(TAG, "Download failed $filename: ${e.message}")
            }
        }

        File(cacheDir, "index.json").writeText(index.toString())
        Log.d(TAG, "Cache sync: ${index.length()} files")
    }

    // ── HTML offline ──────────────────────────────────────────────────────────
    private fun buildOfflineHtml(medias: List<Map<String, String>>): String {
        val slides = medias.mapIndexed { i, m ->
            val active  = if (i == 0) " active" else ""
            val content = if (m["type"] == "video")
                """<video src="${m["url"]}" autoplay muted playsinline></video>"""
            else
                """<img src="${m["url"]}" alt="${m["name"]}">"""
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
<div id="bar"></div><div id="tag">📴 Offline</div>
$slides
<script>
var cur=0,slides=document.querySelectorAll('.slide'),bar=document.getElementById('bar');
function show(i){
  slides.forEach(function(s){s.classList.remove('active');});
  var s=slides[i];if(!s)return;
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

    // ── Tela de espera ────────────────────────────────────────────────────────
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

    // ── Heartbeat ─────────────────────────────────────────────────────────────
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
            if (isOnline()) { handler.post { syncAndLoad() }; return true }
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

    override fun onResume() {
        super.onResume()
        if (screenCode.isNotBlank() && !pageLoaded) {
            if (isOnline()) syncAndLoad() else { loadOffline(); handler.post(retryRunnable) }
        }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        if (::webView.isInitialized) webView.destroy()
        super.onDestroy()
    }
}
