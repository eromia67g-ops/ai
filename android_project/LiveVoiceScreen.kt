package com.ero.emuai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CallEnd
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import motion.react.motion

@Composable
fun LiveVoiceScreen() {
    var isConnected by remember { mutableStateOf(false) }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF050505)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(32.dp)
        ) {
            // Animated Pulse Effect for Voice
            Box(contentAlignment = Alignment.Center) {
                if (isConnected) {
                    Surface(
                        modifier = Modifier.size(200.dp),
                        shape = CircleShape,
                        color = Color(0xFF2563EB).copy(alpha = 0.1f)
                    ) {}
                }
                
                Surface(
                    modifier = Modifier.size(120.dp),
                    shape = CircleShape,
                    color = if (isConnected) Color(0xFF2563EB) else Color(0xFF1A1A1A),
                    shadowElevation = 20.dp
                ) {
                    Icon(
                        Icons.Default.Mic,
                        contentDescription = "Microphone",
                        modifier = Modifier.size(48.dp).padding(24.dp),
                        tint = Color.White
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(48.dp))
            
            Text(
                text = if (isConnected) "Listening..." else "Emu.ai Live",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            
            Text(
                text = if (isConnected) "Real-time voice active" else "Start a low-latency conversation",
                fontSize = 14.sp,
                color = Color.Gray,
                modifier = Modifier.padding(top = 8.dp)
            )
            
            Spacer(modifier = Modifier.height(64.dp))
            
            Button(
                onClick = { isConnected = !isConnected },
                modifier = Modifier.height(56.dp).fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isConnected) Color(0xFFEF4444) else Color(0xFF2563EB)
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(
                    if (isConnected) Icons.Default.CallEnd else Icons.Default.Mic,
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(if (isConnected) "End Conversation" else "Start Live Session")
            }
        }
        
        // Read Aloud Toggle Shortcut
        Surface(
            modifier = Modifier.align(Alignment.TopEnd).padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            color = Color.White.copy(alpha = 0.05f),
            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("পড়া শোনা", fontSize = 10.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.width(8.dp))
                Switch(checked = true, onCheckedChange = {}, colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFF2563EB)))
            }
        }
    }
}
