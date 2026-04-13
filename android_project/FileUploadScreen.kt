package com.ero.emuai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun FileUploadScreen() {
    val uploadedFiles = remember { mutableStateListOf<String>() }
    
    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF050505)).padding(16.dp)) {
        Text("Multimodal Analysis", fontSize = 24.sp, color = Color.White, modifier = Modifier.padding(bottom = 16.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth().height(150.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1A1A)),
            shape = RoundedCornerShape(16.dp),
            onClick = { /* Open File Picker */ }
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.FileUpload, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(32.dp))
                Text("Upload PDF, Image, Video or Audio", color = Color.Gray, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("Recent Files", fontSize = 14.sp, color = Color.Gray, modifier = Modifier.padding(bottom = 8.dp))
        
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (uploadedFiles.isEmpty()) {
                item {
                    Text("No files uploaded yet.", color = Color.DarkGray, fontSize = 12.sp, modifier = Modifier.padding(top = 16.dp))
                }
            }
            items(uploadedFiles) { file ->
                FileItem(file)
            }
        }
    }
}

@Composable
fun FileItem(name: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color(0xFF1A1A1A),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.FilePresent, contentDescription = null, tint = Color.Gray)
            Spacer(modifier = Modifier.width(16.dp))
            Text(name, color = Color.White, fontSize = 14.sp)
        }
    }
}
