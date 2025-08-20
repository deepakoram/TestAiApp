import React, { useState, useRef, useEffect } from 'react';

const AiAgent = () => {
    //  State to manage recording status and transcribed text
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioChunks = useRef([]); //  Buffer to store audio data
    const mediaRecorderRef = useRef(null); // Reference for MediaRecorder
    const streamRef = useRef(null); // Reference for the audio stream
    const speechRef = useRef(null); // Reference for speech synthesis
    console.log(transcript, 'transcript');

    // TTS function to read the transcript using ElevenLabs
    const speakTranscript = async () => {
        if (!transcript) return;
        
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY';
        
        if (apiKey === 'YOUR_ELEVENLABS_API_KEY') {
            setError('Please set your ElevenLabs API key in environment variables (VITE_ELEVENLABS_API_KEY)');
            return;
        }
        
        setIsSpeaking(true);
        setError('');
        
        try {
            // Stop any existing audio
            if (speechRef.current) {
                speechRef.current.pause();
                speechRef.current = null;
            }
            
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text: transcript,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`ElevenLabs TTS API request failed: ${response.status} ${response.statusText} - ${errorData}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const audio = new Audio(audioUrl);
            audio.onended = () => {
                setIsSpeaking(false);
                speechRef.current = null;
                URL.revokeObjectURL(audioUrl); // Clean up the URL
            };
            
            audio.onerror = (error) => {
                console.error('Audio playback error:', error);
                setIsSpeaking(false);
                speechRef.current = null;
                setError('Error playing audio. Please try again.');
                URL.revokeObjectURL(audioUrl);
            };
            
            speechRef.current = audio;
            await audio.play();
            
        } catch (error) {
            console.error('Error with ElevenLabs TTS:', error);
            setError(`Error generating speech: ${error.message}`);
            setIsSpeaking(false);
        }
    };

    // Stop speaking function
    const stopSpeaking = () => {
        if (speechRef.current) {
            speechRef.current.pause();
            speechRef.current.currentTime = 0;
            setIsSpeaking(false);
            speechRef.current = null;
        }
    };

    //  Start recording
    const startRecording = async () => {
        try {
            setError(''); // Clear any previous errors
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream; // Store stream reference for cleanup
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunks.current = []; // Clear previous chunks
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };
            
            mediaRecorderRef.current.onstop = async () => {
                // When recording stops, process the audio and send it to ElevenLabs
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' }); 
                //  You may need to convert the Blob to a different format (like WAV) for ElevenLabs
                await sendAudioToElevenLabs(audioBlob); 
                audioChunks.current = []; // Clear the buffer
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setError('Microphone access denied. Please allow microphone permissions.');
            // Handle microphone access denied gracefully
        }
    };

    //  Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            // Clean up the stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
    };

    //  Send audio data to ElevenLabs STT API
    const sendAudioToElevenLabs = async (audioBlob) => {
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY'; // Use environment variable for Vite
        
        if (apiKey === 'YOUR_ELEVENLABS_API_KEY') {
            setError('Please set your ElevenLabs API key in environment variables (VITE_ELEVENLABS_API_KEY)');
            return;
        }
        
        setIsProcessing(true);
        setError('');
        
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm'); //  Specify filename and mimetype
            formData.append('model_id', 'scribe_v1'); // Use the correct model ID as specified by the API
            formData.append('language_code', 'en'); // Specify language code

            const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                },
                body: formData,
            });

            console.log(response, 'response');

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`ElevenLabs STT API request failed: ${response.status} ${response.statusText} - ${errorData}`);
            }

            const data = await response.json();
            
            if (data.text) {
                setTranscript(data.text); //  Update the transcript state with the received text
                console.log("ElevenLabs transcription:", data.text);
            } else {
                setError('No transcription received from the API');
            }
        } catch (error) {
            console.error('Error sending audio to ElevenLabs:', error);
            setError(`Error processing audio: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (transcript) {
            speakTranscript();
        }
    }, [transcript]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>AI Voice Agent</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={startRecording} 
                    disabled={isRecording || isProcessing}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: isRecording ? '#ff4444' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isRecording || isProcessing ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isRecording ? 'Recording...' : 'Start Recording'}
                </button>
                
                <button 
                    onClick={stopRecording} 
                    disabled={!isRecording || isProcessing}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: !isRecording ? '#cccccc' : '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: !isRecording || isProcessing ? 'not-allowed' : 'pointer'
                    }}
                >
                    Stop Recording
                </button>
            </div>
            
            {isProcessing && (
                <div style={{ marginBottom: '10px', color: '#2196F3' }}>
                    Processing audio...
                </div>
            )}
            
            {error && (
                <div style={{ marginBottom: '10px', color: '#f44336', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px' }}>
                    {error}
                </div>
            )}
            
            {transcript && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Transcript:</h3>
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        minHeight: '100px'
                    }}>
                        {transcript}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <button 
                            onClick={isSpeaking ? stopSpeaking : speakTranscript} 
                            disabled={!transcript}
                            style={{
                                padding: '10px 20px',
                                marginRight: '10px',
                                backgroundColor: isSpeaking ? '#ff9800' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: !transcript ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSpeaking ? 'Stop Speaking' : 'Speak Transcript'}
                        </button>
                        {isSpeaking && (
                            <span style={{ color: '#2196F3', fontSize: '14px' }}>
                                🔊 Speaking...
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiAgent;
