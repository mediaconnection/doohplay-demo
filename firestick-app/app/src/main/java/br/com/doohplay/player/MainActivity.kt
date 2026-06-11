package br.com.doohplay.player

import android.annotation.SuppressLint
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val handler = Handler(Looper.getMainLooper())
    private var screenCode = "BARBE332" // Código padrão — sobrescrito pelo Intent
    private val BASE_URL = "https://doohplay.com.br/player?screen="

    private val retryRunnable = object : Runnable {
        override fun run() {
            if (!isNetworkAvailable()) {
                handler.postDelayed(this, 10_000)
            } else {
                loadPlayer()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Kiosk mode — tela cheia sem status bar
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_FULLSCREEN or
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        )

        // Pega o código da tela via Intent (ex: adb shell am start -e screen BARBE332)
        intent.getStringExtra("screen")?.let { screenCode = it }

        // Layout
        val container = FrameLayout(this)
        container.setBackgroundColor(android.graphics.Color.BLACK)
        setContentView(container)

        // WebView
        webView = WebView(this)
        container.addView(webView, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ))

        // Configurações do WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            loadWithOverviewMode = true
            useWideViewPort = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) {
                    // Tenta recarregar em 10s
                    handler.postDelayed({ loadPlayer() }, 10_000)
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                // Remove qualquer scroll ou overhead
                view.evaluateJavascript(
                    "document.body.style.overflow='hidden'; document.documentElement.style.overflow='hidden';",
                    null
                )
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(msg: ConsoleMessage): Boolean = true
        }

        loadPlayer()
    }

    private fun loadPlayer() {
        val url = BASE_URL + screenCode
        webView.loadUrl(url)
    }

    private fun isNetworkAvailable(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    // Bloqueia botão voltar — kiosk
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK) return true
        return super.onKeyDown(keyCode, event)
    }

    override fun onResume() {
        super.onResume()
        // Reconecta se estava offline
        if (!isNetworkAvailable()) {
            handler.post(retryRunnable)
        } else {
            loadPlayer()
        }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        webView.destroy()
        super.onDestroy()
    }
}
