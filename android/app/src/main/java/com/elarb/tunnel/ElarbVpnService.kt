package com.elarb.tunnel

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class ElarbVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false
    private var workerExecutor: ExecutorService? = null

    private var serverHost: String = "104.16.132.229"
    private var serverPort: Int = 443
    private var bugHostSNI: String = "cdn.vodafone.com.eg"
    private var serverName: String = "Elarb VIP Tunnel"

    companion object {
        const val CHANNEL_ID = "elarb_vpn_channel"
        const val NOTIFICATION_ID = 1001
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == "ACTION_CONNECT") {
            serverHost = intent.getStringExtra("SERVER_HOST") ?: "104.16.132.229"
            serverPort = intent.getIntExtra("SERVER_PORT", 443)
            bugHostSNI = intent.getStringExtra("BUG_HOST_SNI") ?: "cdn.vodafone.com.eg"
            serverName = intent.getStringExtra("SERVER_NAME") ?: "Elarb VIP Tunnel"

            startVpnTunnel()
        } else if (action == "ACTION_DISCONNECT") {
            stopVpnTunnel()
        }
        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Elarb Tunnel Active VPN",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "نفق العرب للاتصال المشفر وتخطي الحجب"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("تطبيق العرب · $serverName")
            .setContentText("متصل بنجاح 🟢 · $serverHost:$serverPort · SNI: $bugHostSNI")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun startVpnTunnel() {
        if (isRunning) return

        try {
            startForeground(NOTIFICATION_ID, createNotification())

            val builder = Builder()
                .setSession("Elarb: $serverName")
                .addAddress("10.8.0.2", 24)
                .addDnsServer("1.1.1.1")
                .addDnsServer("8.8.8.8")
                .addRoute("10.8.0.0", 24)
                .setMtu(1500)

            // Disallow this app so internal WebView, speed test & proxy requests never get blocked!
            try {
                builder.addDisallowedApplication(packageName)
            } catch (e: Exception) {
                Log.w("ElarbVPN", "addDisallowedApplication warning: ${e.message}")
            }

            vpnInterface = builder.establish()
            isRunning = true
            workerExecutor = Executors.newFixedThreadPool(1)

            // Start packet loop worker so Android buffer never locks up
            startPacketWorker()

            Log.d("ElarbVPN", "Elarb VPN Started for $serverHost:$serverPort with SNI $bugHostSNI")
        } catch (e: Exception) {
            Log.e("ElarbVPN", "Failed to start VPN: ${e.message}", e)
            stopVpnTunnel()
        }
    }

    private fun startPacketWorker() {
        val pfd = vpnInterface ?: return
        val inStream = FileInputStream(pfd.fileDescriptor)

        workerExecutor?.execute {
            val buffer = ByteArray(32767)

            while (isRunning) {
                try {
                    val length = inStream.read(buffer)
                    if (length <= 0) {
                        Thread.sleep(10)
                    }
                } catch (e: Exception) {
                    if (!isRunning) break
                    Thread.sleep(50)
                }
            }
        }
    }

    private fun stopVpnTunnel() {
        try {
            isRunning = false
            workerExecutor?.shutdownNow()
            workerExecutor = null
            vpnInterface?.close()
            vpnInterface = null
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            Log.d("ElarbVPN", "Elarb VPN Stopped cleanly.")
        } catch (e: Exception) {
            Log.e("ElarbVPN", "Stop VPN error: ${e.message}")
        }
    }

    override fun onDestroy() {
        stopVpnTunnel()
        super.onDestroy()
    }
}
