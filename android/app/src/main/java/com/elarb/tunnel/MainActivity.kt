package com.elarb.tunnel

import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private val VPN_REQUEST_CODE = 2026
    private var isConnected = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnConnect = findViewById<Button>(R.id.btnConnect)
        btnConnect.setOnClickListener {
            if (!isConnected) {
                prepareAndStartVpn()
            } else {
                stopVpnService()
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
        } else {
            Toast.makeText(this, "تم رفض إذن الاتصال من المستخدم 🔴", Toast.LENGTH_SHORT).show()
        }
    }

    private fun stopVpnService() {
        val vpnIntent = Intent(this, ElarbVpnService::class.java).apply {
            action = "ACTION_DISCONNECT"
        }
        startService(vpnIntent)
        isConnected = false
        Toast.makeText(this, "تم فصل الاتصال 🔴", Toast.LENGTH_SHORT).show()
    }
}
