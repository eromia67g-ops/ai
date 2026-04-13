package com.ero.emuai

import com.google.firebase.vertexai.FirebaseVertexAI
import com.google.firebase.vertexai.type.content
import com.google.firebase.vertexai.type.generationConfig

class VertexAIService(apiKey: String) {
    private val vertexAI = FirebaseVertexAI.getInstance()
    
    // Using Gemini 1.5 Pro or Flash via Vertex AI for Firebase
    private val model = vertexAI.generativeModel(
        modelName = "gemini-1.5-flash",
        generationConfig = generationConfig {
            temperature = 1.0f
            topK = 32
            topP = 1.0f
        }
    )

    suspend fun analyzeMultimodal(prompt: String, mediaData: ByteArray, mimeType: String): String? {
        val inputContent = content {
            blob(mimeType, mediaData)
            text(prompt)
        }
        return try {
            val response = model.generateContent(inputContent)
            response.text
        } catch (e: Exception) {
            e.message
        }
    }
}
