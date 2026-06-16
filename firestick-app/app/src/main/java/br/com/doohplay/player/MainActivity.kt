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
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var prefs: SharedPreferences
    private val handler = Handler(Looper.getMainLooper())
    private val API_BASE = "https://doohplay.com.br"
    private val TAG = "DOOHPlayer"

    private val retryRunnable = object : Runnable {
        override fun run() {
            val code = prefs.getString("screen_code", "") ?: ""
            if (isOnline()) {
                if (code.isBlank()) loadUrl("$API_BASE/ativar")
                else loadUrl("$API_BASE/player?screen=$code")
            } else {
                handler.postDelayed(this, 15_000)
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

        prefs = getSharedPreferences("doohplay", Context.MODE_PRIVATE)

        // Container preto
        val container = FrameLayout(this)
        container.setBackgroundColor(android.graphics.Color.BLACK)
        setContentView(container)

        // WebView ocupa tudo
        webView = WebView(this)
        container.addView(
            webView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        )

        // Configurações
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
            override fun onReceivedError(
                view: WebView, request: WebResourceRequest, error: WebResourceError
            ) {
                if (request.isForMainFrame) {
                    Log.w(TAG, "Error: ${error.description}")
                    // Se cair internet, tenta de novo em 15s
                    handler.postDelayed(retryRunnable, 15_000)
                }
            }
            override fun onReceivedSslError(
                view: WebView, handler: SslErrorHandler, error: android.net.http.SslError
            ) {
                handler.proceed()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(msg: ConsoleMessage): Boolean {
                Log.d(TAG, "JS: ${msg.message()}")
                return true
            }
        }

        // Interface JavaScript → Android
        webView.addJavascriptInterface(AndroidInterface(), "AndroidPlayer")

        // Decide o que carregar
        val code = prefs.getString("screen_code", "") ?: ""
        if (code.isBlank()) {
            // Primeira vez — página de ativação
            loadUrl("$API_BASE/ativar")
        } else {
            // Já ativado — vai direto pro player
            loadUrl("$API_BASE/player?screen=$code")
            startHeartbeat(code)
            startCacheSync(code)
        }
    }

    private fun loadUrl(url: String) {
        Log.d(TAG, "Loading: $url")
        webView.loadUrl(url)
    }

    // ── Interface JS → Android ────────────────────────────────────────────────
    inner class AndroidInterface {

        // Chamado pela página /ativar após validação
        @JavascriptInterface
        fun saveCode(code: String) {
            val clean = code.trim().uppercase()
            prefs.edit().putString("screen_code", clean).apply()
            Log.d(TAG, "Code saved: $clean")
            handler.post {
                loadUrl("$API_BASE/player?screen=$clean")
                startHeartbeat(clean)
                startCacheSync(clean)
            }
        }

        // Chamado pelo player para verificar status
        @JavascriptInterface
        fun getCode(): String {
            return prefs.getString("screen_code", "") ?: ""
        }

        // Reseta ativação (para trocar de TV)
        @JavascriptInterface
        fun resetCode() {
            prefs.edit().remove("screen_code").apply()
            handler.post { loadUrl("$API_BASE/ativar") }
        }
    }

    // ── Heartbeat ─────────────────────────────────────────────────────────────
    private fun startHeartbeat(code: String) {
        handler.postDelayed(object : Runnable {
            override fun run() {
                Thread {
                    try {
                        val conn = URL("$API_BASE/api/player/heartbeat")
                            .openConnection() as HttpURLConnection
                        conn.requestMethod = "POST"
                        conn.setRequestProperty("Content-Type", "application/json")
                        conn.doOutput      = true
                        conn.connectTimeout = 5_000
                        conn.readTimeout    = 5_000
                        conn.outputStream.write("""{"code":"$code"}""".toByteArray())
                        conn.responseCode
                        conn.disconnect()
                        Log.d(TAG, "Heartbeat ✓")
                    } catch (e: Exception) {
                        Log.d(TAG, "Heartbeat failed: ${e.message}")
                    }
                }.start()
                handler.postDelayed(this, 30_000)
            }
        }, 30_000)
    }

    // ── Cache offline ─────────────────────────────────────────────────────────
    private fun startCacheSync(code: String) {
        Thread {
            try {
                val conn = URL("$API_BASE/api/client/playlist/$code")
                    .openConnection() as HttpURLConnection
                conn.connectTimeout = 10_000
                conn.readTimeout    = 15_000
                val response = conn.inputStream.bufferedReader().readText()
                conn.disconnect()

                val items    = org.json.JSONObject(response).getJSONArray("items")
                val cacheDir = File(filesDir, "media_cache/$code").also { it.mkdirs() }
                val index    = JSONArray()

                for (i in 0 until items.length()) {
                    val item   = items.getJSONObject(i)
                    val url    = item.optString("asset_url")
                    val type   = item.optString("type", "image")
                    val name   = item.optString("name", "")
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

                    val localFile = File(cacheDir, "media_$i.$ext")
                    try {
                        val mc = URL(url).openConnection() as HttpURLConnection
                        mc.connectTimeout = 15_000; mc.readTimeout = 60_000
                        localFile.writeBytes(mc.inputStream.readBytes())
                        mc.disconnect()

                        val idx = org.json.JSONObject()
                        idx.put("filename", "media_$i.$ext")
                        idx.put("type", type); idx.put("name", name)
                        idx.put("duration", dur.toString())
                        index.put(idx)
                        Log.d(TAG, "Cached: media_$i.$ext")
                    } catch (e: Exception) {
                        Log.e(TAG, "Download failed media_$i: ${e.message}")
                    }
                }

                File(cacheDir, "index.json").writeText(index.toString())
                Log.d(TAG, "Cache sync done: ${index.length()} files")
            } catch (e: Exception) {
                Log.e(TAG, "Cache sync error: ${e.message}")
            }
        }.start()
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

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        webView.destroy()
        super.onDestroy()
    }
}
