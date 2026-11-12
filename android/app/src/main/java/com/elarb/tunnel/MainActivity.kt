package com.elarb.tunnel

import android.annotation.SuppressLint
import android.content.Intent
import android.net.VpnService
import android.os.Build
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

    private var selectedServerHost: String = "104.16.132.229"
    private var selectedServerPort: Int = 443
    private var selectedBugHostSNI: String = "cdn.vodafone.com.eg"
    private var selectedProtocol: String = "SSH_SSL"
    private var selectedServerName: String = "Vodafone EG [0.0 Bug SNI]"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.allowFileAccessFromFileURLs = true
        settings.allowUniversalAccessFromFileURLs = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                // If any network error occurs, fallback to local asset instantly
                if (failingUrl != null && !failingUrl.startsWith("file:///android_asset/")) {
                    webView.loadUrl("file:///android_asset/index.html")
                }
            }
        }

        webView.addJavascriptInterface(WebAppInterface(), "AndroidVPN")

        // Load the bundled offline web app directly from local assets
        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun startVpn(serverHost: String, serverPort: Int, bugHostSNI: String, protocol: String, serverName: String) {
            runOnUiThread {
                selectedServerHost = serverHost
                selectedServerPort = serverPort
                selectedBugHostSNI = bugHostSNI
                selectedProtocol = protocol
                selectedServerName = serverName
                prepareAndStartVpn()
            }
        }

        @JavascriptInterface
        fun startVpn() {
            runOnUiThread {
                prepareAndStartVpn()
            }
        }

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

        @JavascriptInterface
        fun stopVpn() {
            runOnUiThread {
                stopVpnService()
            }
        }

        @JavascriptInterface
        fun isVpnConnected(): Boolean {
            return isConnected
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
                putExtra("SERVER_HOST", selectedServerHost)
                putExtra("SERVER_PORT", selectedServerPort)
                putExtra("BUG_HOST_SNI", selectedBugHostSNI)
                putExtra("PROTOCOL", selectedProtocol)
                putExtra("SERVER_NAME", selectedServerName)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(vpnIntent)
            } else {
                startService(vpnIntent)
            }
            isConnected = true
            Toast.makeText(this, "تم تفعيل نفق العرب بنجاح 🟢 [$selectedServerName]", Toast.LENGTH_SHORT).show()
            webView.evaluateJavascript("javascript:if(window.onVpnConnected) window.onVpnConnected();", null)
        } else {
            Toast.makeText(this, "تم رفض إذن اتصال الـ VPN 🔴", Toast.LENGTH_SHORT).show()
            webView.evaluateJavascript("javascript:if(window.onVpnDisconnected) window.onVpnDisconnected();", null)
        }
    }

    private fun stopVpnService() {
        val vpnIntent = Intent(this, ElarbVpnService::class.java).apply {
            action = "ACTION_DISCONNECT"
        }
        startService(vpnIntent)
        isConnected = false
        Toast.makeText(this, "تم فصل اتصال الـ VPN 🔴", Toast.LENGTH_SHORT).show()
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
