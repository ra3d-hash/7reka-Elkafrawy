package com.elarb.tunnel

import android.annotation.SuppressLint
import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private val VPN_REQUEST_CODE = 2026
    private var isConnected = false
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(WebAppInterface(), "AndroidVPN")

        webView.loadUrl("https://ais-pre-iwcr4dhfkxew7zasw2kv7g-372664681136.europe-west1.run.app")
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun toggleVpn() {
            runOnUiThread {
                if (!isConnected) {
                    prepareAndStartVpn()
                } else {
                    stopVpnService()
                }
            }
        }
    }

    private fun prepareAndStartVpn() {
        val intent = VpnService.prepare(this)
        if (intent != null) {
            startActivityForResult(intent, VPN_REQUEST_CODE)
        } else {
            onActivityResult(VPN_REQUEST_CODE, RESULT_OK, null)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == VPN_REQUEST_CODE && resultCode == RESULT_OK) {
            val vpnIntent = Intent(this, ElarbVpnService::class.java).apply {
                action = "ACTION_CONNECT"
            }
            startService(vpnIntent)
            isConnected = true
            Toast.makeText(this, "تم تفعيل VPN العرب بنجاح 🟢", Toast.LENGTH_SHORT).show()
            webView.evaluateJavascript("javascript:if(window.onVpnConnected) window.onVpnConnected();", null)
        } else {
            Toast.makeText(this, "تم رفض إذن الاتصال 🔴", Toast.LENGTH_SHORT).show()
        }
    }

    private fun stopVpnService() {
        val vpnIntent = Intent(this, ElarbVpnService::class.java).apply {
            action = "ACTION_DISCONNECT"
        }
        startService(vpnIntent)
        isConnected = false
        Toast.makeText(this, "تم فصل الاتصال 🔴", Toast.LENGTH_SHORT).show()
        webView.evaluateJavascript("javascript:if(window.onVpnDisconnected) window.onVpnDisconnected();", null)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
