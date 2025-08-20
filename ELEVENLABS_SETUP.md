# ElevenLabs Speech-to-Text Integration

This project now includes ElevenLabs speech-to-text functionality that allows you to convert spoken audio to text using AI.

## Setup Instructions

### 1. Get an ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up for a free account
3. Go to your profile settings
4. Copy your API key from the API section

### 2. Using the Speech-to-Text Feature

1. **Navigate to the Speech tab** in the app
2. **Enter your API key** in the provided field (it will be saved locally)
3. **Click "Start Recording"** to begin recording audio
4. **Speak clearly** into your microphone
5. **Click "Stop Recording"** when finished
6. **Click "Transcribe"** to convert your speech to text
7. **Copy the transcript** using the copy button

## Features

- ✅ **Real-time recording** with visual feedback
- ✅ **Audio playback** to review your recording
- ✅ **Secure API key storage** (saved locally)
- ✅ **Error handling** for common issues
- ✅ **Copy to clipboard** functionality
- ✅ **Responsive design** for mobile and desktop
- ✅ **Loading states** and progress indicators

## Technical Details

- Uses the **ElevenLabs Speech-to-Text API**
- Supports **WAV audio format**
- Uses the **eleven_english_sts_v2** model
- Implements **MediaRecorder API** for audio capture
- Stores API key in **localStorage** for convenience

## Troubleshooting

### Common Issues:

1. **"Error accessing microphone"**
   - Make sure your browser has permission to access the microphone
   - Try refreshing the page and granting permission again

2. **"Invalid API key"**
   - Double-check your ElevenLabs API key
   - Make sure you have sufficient credits in your ElevenLabs account

3. **"Missing required fields: body.model_id"**
   - This error indicates an issue with the API request format
   - Try refreshing the page and recording again
   - Ensure you're using the latest version of the app
   - Check the browser console for additional error details

4. **"No transcript received"**
   - Try speaking more clearly
   - Ensure there's enough audio content (at least a few seconds)
   - Check your internet connection

5. **"Audio not recording"**
   - Check if your microphone is working in other applications
   - Try using a different browser
   - Ensure you're on HTTPS (required for microphone access)

6. **"Invalid audio format"**
   - The app now uses WebM audio format for better compatibility
   - Try using a modern browser (Chrome, Firefox, Safari, Edge)
   - Ensure your microphone is working properly

## API Usage

The free tier of ElevenLabs includes:
- 10,000 characters per month
- Access to speech-to-text models
- Basic voice cloning features

For more usage, consider upgrading to a paid plan.

## Security Notes

- Your API key is stored locally in your browser's localStorage
- Never share your API key publicly
- The API key is only used to make requests to ElevenLabs servers
- No audio data is stored on our servers 