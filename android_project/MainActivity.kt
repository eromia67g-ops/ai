package com.ero.emuai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.currentBackStackEntryAsState
import com.ero.emuai.ui.theme.EmuaiTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            EmuaiTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val geminiService = remember { 
        GeminiService(
            apiKey = "YOUR_API_KEY", // Should be loaded from settings/datastore
            modelName = "gemini-flash-latest",
            temperature = 0.7f
        )
    }
    val items = listOf(
        NavigationItem("chat", "Chat", Icons.Default.Message),
        NavigationItem("live", "Live", Icons.Default.Mic),
        NavigationItem("screen", "Screen", Icons.Default.Monitor),
        NavigationItem("files", "Files", Icons.Default.FilePresent),
        NavigationItem("settings", "Settings", Icons.Default.Settings)
    )

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF0A0A0A)) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = currentRoute == item.route,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.startDestinationId)
                                launchSingleTop = true
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF2563EB),
                            unselectedIconColor = Color.Gray
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController, 
            startDestination = "chat",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("chat") { 
                ChatScreen(
                    geminiService = geminiService,
                    onOpenSettings = { navController.navigate("settings") }
                ) 
            }
            composable("live") { LiveVoiceScreen() }
            composable("screen") { ScreenShareScreen() }
            composable("files") { FileUploadScreen() }
            composable("settings") { 
                SettingsScreen(onBack = { navController.popBackStack() }) 
            }
        }
    }
}

data class NavigationItem(val route: String, val label: String, val icon: ImageVector)
