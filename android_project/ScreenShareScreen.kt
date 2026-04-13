package com.ero.emuai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Monitor
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ScreenShareScreen() {
    var isSharing by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF050505)).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.Monitor,
            contentDescription = null,
            modifier = Modifier.size(80.dp),
            tint = if (isSharing) Color(0xFF2563EB) else Color.Gray
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            "Screen Share Mode",
            fontSize = 20.sp,
            color = Color.White
        )
        
        Text(
            "Gemini will see your screen and help you in real-time.",
            fontSize = 12.sp,
            color = Color.Gray,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp)
        )
        
        Spacer(modifier = Modifier.height(48.dp))
        
        Button(
            onClick = { isSharing = !isSharing },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isSharing) Color(0xFFEF4444) else Color(0xFF2563EB)
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(if (isSharing) Icons.Default.Stop else Icons.Default.Monitor, contentDescription = null)
            Spacer(modifier = Modifier.width(12.dp))
            Text(if (isSharing) "Stop Sharing" else "Start Screen Share")
        }
    }
}
