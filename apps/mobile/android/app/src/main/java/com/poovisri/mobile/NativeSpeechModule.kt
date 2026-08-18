package com.poovisri.mobile

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.*

class NativeSpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var speechRecognizer: SpeechRecognizer? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isListening = false

    override fun getName(): String {
        return "NativeSpeechModule"
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            if (reactContext.hasActiveReactInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            }
        } catch (e: Exception) {
            // Ignore background emission errors
        }
    }

    @ReactMethod
    fun isRecognitionAvailable(promise: Promise) {
        try {
            val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
            promise.resolve(available)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun startListening(language: String?, promise: Promise) {
        mainHandler.post {
            try {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer?.cancel()
                        speechRecognizer?.destroy()
                    } catch (e: Exception) {
                    }
                    speechRecognizer = null
                }

                if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
                    promise.reject("SPEECH_NOT_AVAILABLE", "Speech recognition service not available on device")
                    return@post
                }

                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
                speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        isListening = true
                        val map = Arguments.createMap()
                        map.putString("status", "ready")
                        sendEvent("onSpeechStart", map)
                    }

                    override fun onBeginningOfSpeech() {
                        val map = Arguments.createMap()
                        map.putString("status", "speaking")
                        sendEvent("onSpeechStart", map)
                    }

                    override fun onRmsChanged(rmsdB: Float) {
                        val map = Arguments.createMap()
                        map.putDouble("rms", rmsdB.toDouble())
                        sendEvent("onSpeechVolume", map)
                    }

                    override fun onBufferReceived(buffer: ByteArray?) {}

                    override fun onEndOfSpeech() {
                        isListening = false
                        val map = Arguments.createMap()
                        map.putString("status", "ended")
                        sendEvent("onSpeechEnd", map)
                    }

                    override fun onError(error: Int) {
                        isListening = false
                        val errorMessage = getErrorText(error)
                        val map = Arguments.createMap()
                        map.putInt("errorCode", error)
                        map.putString("error", errorMessage)
                        sendEvent("onSpeechError", map)
                    }

                    override fun onResults(results: Bundle?) {
                        isListening = false
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val map = Arguments.createMap()
                        val text = if (!matches.isNullOrEmpty()) matches[0] else ""
                        map.putString("text", text)
                        map.putBoolean("isFinal", true)
                        sendEvent("onSpeechRecognized", map)
                    }

                    override fun onPartialResults(partialResults: Bundle?) {
                        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (!matches.isNullOrEmpty()) {
                            val map = Arguments.createMap()
                            map.putString("text", matches[0])
                            map.putBoolean("isFinal", false)
                            sendEvent("onSpeechRecognized", map)
                        }
                    }

                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                    val lang = if (!language.isNullOrBlank()) language else "ta-IN"
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang)
                    putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("ta-IN", "en-IN", "ta"))
                }

                speechRecognizer?.startListening(intent)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SPEECH_ERROR", e.localizedMessage ?: "Failed to start speech recognition")
            }
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        mainHandler.post {
            try {
                if (speechRecognizer != null) {
                    speechRecognizer?.stopListening()
                }
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SPEECH_STOP_ERROR", e.localizedMessage ?: "Failed to stop speech recognition")
            }
        }
    }

    @ReactMethod
    fun cancel(promise: Promise) {
        mainHandler.post {
            try {
                if (speechRecognizer != null) {
                    speechRecognizer?.cancel()
                    speechRecognizer?.destroy()
                    speechRecognizer = null
                }
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SPEECH_CANCEL_ERROR", e.localizedMessage ?: "Failed to cancel speech recognition")
            }
        }
    }

    @ReactMethod
    fun addListener(eventName: String?) {}

    @ReactMethod
    fun removeListeners(count: Double?) {}

    private fun getErrorText(errorCode: Int): String {
        return when (errorCode) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client side error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient audio permissions"
            SpeechRecognizer.ERROR_NETWORK -> "Network connection required for speech"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech recognized. Please speak clearly."
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Speech recognizer is busy. Retrying..."
            SpeechRecognizer.ERROR_SERVER -> "Google Speech Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech detected"
            else -> "Speech recognition error code: $errorCode"
        }
    }
}
