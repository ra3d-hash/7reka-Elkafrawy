package com.elarb.tunnel

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log

class ElarbVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == "ACTION_CONNECT") {
            startVpnTunnel()
        } else if (action == "ACTION_DISCONNECT") {
            stopVpnTunnel()
        }
        return START_STICKY
    }

    private fun startVpnTunnel() {
        if (isRunning) return

        try {
            val builder = Builder()
                .setSession("Elarb Tunnel VIP")
                .addAddress("10.0.0.2", 24)
                .addDnsServer("1.1.1.1")
                .addDnsServer("8.8.8.8")
                .addRoute("0.0.0.0", 0)

            builder.setMtu(1500)

            vpnInterface = builder.establish()
            isRunning = true
            Log.d("ElarbVPN", "تم تفعيل نفق VPN بنجاح 100%!")

        } catch (e: Exception) {
            Log.e("ElarbVPN", "خطأ أثناء تفعيل النفق: ${e.message}")
            stopVpnTunnel()
        }
    }

    private fun stopVpnTunnel() {
        try {
            vpnInterface?.close()
            vpnInterface = null
            isRunning = false
            stopSelf()
            Log.d("ElarbVPN", "تم إيقاف نفق VPN.")
        } catch (e: Exception) {
            Log.e("ElarbVPN", "خطأ أثناء الإيقاف: ${e.message}")
        }
    }

    override fun onDestroy() {
        stopVpnTunnel()
        super.onDestroy()
    }
}
