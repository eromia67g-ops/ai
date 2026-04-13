package com.ero.emuai

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

data class Message(val text: String, val isUser: Boolean, val id: Long = System.currentTimeMillis())

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(geminiService: GeminiService, onOpenSettings: () -> Unit) {
    var inputText by remember { mutableStateOf("") }
    val messages = remember { mutableStateListOf<Message>() }
    var isLoading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }
    
    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF050505))) {
        TopAppBar(
            title = { 
                Column {
                    Text("Emu.ai", color = Color.White, fontSize = 18.sp)
                    if (isLoading) {
                        Text("Typing...", color = Color(0xFF2563EB), fontSize = 10.sp)
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(Color.Green))
                            Spacer(Modifier.width(4.dp))
                            Text("Online", color = Color.Gray, fontSize = 10.sp)
                        }
                    }
                }
            },
            actions = {
                IconButton(onClick = onOpenSettings) {
                    Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color.White)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF050505))
        )
        
        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            reverseLayout = false
        ) {
            items(messages, key = { it.id }) { message ->
                ChatBubble(message)
            }
            if (isLoading && (messages.isEmpty() || messages.last().isUser)) {
                item {
                    TypingIndicator()
                }
            }
        }
        
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextField(
                value = inputText,
                onValueChange = { inputText = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Type your message...", color = Color.Gray) },
                colors = TextFieldDefaults.textFieldColors(
                    containerColor = Color(0xFF1A1A1A),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    cursorColor = Color(0xFF2563EB)
                ),
                shape = RoundedCornerShape(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            FloatingActionButton(
                onClick = {
                    if (inputText.isNotBlank() && !isLoading) {
                        val userMsg = Message(inputText, true)
                        messages.add(userMsg)
                        val prompt = inputText
                        inputText = ""
                        isLoading = true
                        
                        scope.launch {
                            try {
                                val botMsgId = System.currentTimeMillis()
                                messages.add(Message("", false, botMsgId))
                                var fullResponse = ""
                                geminiService.generateResponseStream(prompt).collect { chunk ->
                                    fullResponse += chunk.text ?: ""
                                    val index = messages.indexOfFirst { it.id == botMsgId }
                                    if (index != -1) {
                                        messages[index] = messages[index].copy(text = fullResponse)
                                    }
                                }
                            } catch (e: Exception) {
                                messages.add(Message("Error: ${e.message}", false))
                            } finally {
                                isLoading = false
                            }
                        }
                    }
                },
                containerColor = Color(0xFF2563EB),
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send")
            }
        }
    }
}

@Composable
fun TypingIndicator() {
    Row(
        modifier = Modifier.padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            color = Color(0xFF1A1A1A),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                repeat(3) { i ->
                    val infiniteTransition = rememberInfiniteTransition()
                    val opacity by infiniteTransition.animateFloat(
                        initialValue = 0.3f,
                        targetValue = 1f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(600, easing = LinearEasing),
                            repeatMode = RepeatMode.Reverse,
                            initialStartOffset = StartOffset(i * 200)
                        )
                    )
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF2563EB).copy(alpha = opacity))
                    )
                }
            }
        }
    }
}

@Composable
fun ChatBubble(message: Message) {
    val alignment = if (message.isUser) Alignment.End else Alignment.Start
    val color = if (message.isUser) Color(0xFF2563EB) else Color(0xFF1A1A1A)
    
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalAlignment = alignment) {
        Surface(
            color = color,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Text(
                text = message.text,
                modifier = Modifier.padding(12.dp),
                color = Color.White,
                fontSize = 14.sp
            )
        }
    }
}
