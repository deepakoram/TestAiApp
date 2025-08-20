import React, { useState, useRef, useEffect } from 'react';

const AiAgent = () => {
    //  State to manage recording status and transcribed text
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messageHistory, setMessageHistory] = useState([]); // Store conversation history
    const audioChunks = useRef([]); //  Buffer to store audio data
    const mediaRecorderRef = useRef(null); // Reference for MediaRecorder
    const streamRef = useRef(null); // Reference for the audio stream
    const speechRef = useRef(null); // Reference for speech synthesis
    const messagesEndRef = useRef(null); // Reference for auto-scroll
    console.log(transcript, 'transcript');

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageHistory]);

    // Banking Q&A Database
    const bankingQA = [
        {
            keywords: ['balance', 'account balance', 'how much', 'money', 'funds'],
            question: 'What is my account balance?',
            answer: 'Your current account balance is $2,450.75. This includes your checking account with $1,200.50 and savings account with $1,250.25.'
        },
        {
            keywords: ['transaction', 'transaction status', 'payment', 'transfer', 'pending'],
            question: 'What is my transaction status?',
            answer: 'Your recent transaction of $150.00 to Amazon.com is still pending and should be processed within 1-2 business days. Your previous transaction of $75.50 to Starbucks has been completed successfully.'
        },
        {
            keywords: ['card', 'debit card', 'credit card', 'card status', 'blocked'],
            question: 'Is my card working?',
            answer: 'Your debit card is active and working normally. There are no restrictions or blocks on your account. You can use it for purchases and ATM withdrawals.'
        },
        {
            keywords: ['deposit', 'deposited', 'when', 'clear', 'available'],
            question: 'When will my deposit be available?',
            answer: 'Your deposit of $500.00 made today will be available in your account by tomorrow morning at 9 AM. Standard deposits typically clear within 1 business day.'
        },
        {
            keywords: ['withdraw', 'withdrawal', 'atm', 'cash', 'limit'],
            question: 'What is my withdrawal limit?',
            answer: 'Your daily ATM withdrawal limit is $500.00, and your daily purchase limit is $2,000.00. You can increase these limits by contacting customer service.'
        },
        {
            keywords: ['interest', 'rate', 'savings', 'apy', 'earnings'],
            question: 'What is my interest rate?',
            answer: 'Your savings account currently earns 2.5% APY. You earned $15.75 in interest this month. Your checking account earns 0.1% APY on balances over $1,000.'
        },
        {
            keywords: ['fee', 'charges', 'monthly fee', 'service charge'],
            question: 'Are there any fees on my account?',
            answer: 'You have no monthly maintenance fees on your account. Your last transaction fee was $3.50 for an out-of-network ATM withdrawal on March 15th.'
        },
        {
            keywords: ['statement', 'monthly statement', 'bill', 'invoice'],
            question: 'When is my statement available?',
            answer: 'Your monthly statement will be available online on the 1st of each month. Your current statement period ends on the 31st, and the new statement will be ready on the 1st.'
        },
        {
            keywords: ['loan', 'mortgage', 'payment', 'due date', 'installment'],
            question: 'When is my loan payment due?',
            answer: 'Your mortgage payment of $1,250.00 is due on the 15th of each month. Your next payment is due in 8 days. You can make early payments through the mobile app.'
        },
        {
            keywords: ['fraud', 'suspicious', 'unauthorized', 'security', 'alert'],
            question: 'Is my account secure?',
            answer: 'Your account is secure and there are no suspicious activities detected. We have fraud monitoring systems in place 24/7. If you notice any unauthorized transactions, please contact us immediately.'
        }
    ];

    // Function to find matching banking answer
    const findBankingAnswer = (transcript) => {
        const lowerTranscript = transcript.toLowerCase();
        
        for (const qa of bankingQA) {
            for (const keyword of qa.keywords) {
                if (lowerTranscript.includes(keyword.toLowerCase())) {
                    return qa.answer;
                }
            }
        }
        return null;
    };

    // Function to add message to history
    const addToMessageHistory = (question, answer, timestamp) => {
        const newMessage = {
            id: Date.now(),
            question,
            answer,
            timestamp,
            isBankingQuestion: !!answer
        };
        setMessageHistory(prev => [...prev, newMessage]);
    };

    // Function to clear message history
    const clearMessageHistory = () => {
        setMessageHistory([]);
    };

    // TTS function to read the transcript using ElevenLabs
    const speakTranscript = async (textToSpeak = null) => {
        const text = textToSpeak || transcript;
        if (!text) return;
        
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
                    text: text,
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
            // Check if transcript contains banking-related questions
            const bankingAnswer = findBankingAnswer(transcript);
            const timestamp = new Date().toLocaleString();
            
            // Add to message history
            addToMessageHistory(transcript, bankingAnswer, timestamp);
            
            if (bankingAnswer) {
                // Automatically speak the banking answer
                setTimeout(() => {
                    speakTranscript(bankingAnswer);
                }, 1000); // Small delay to ensure transcript is set
            }
        }
    }, [transcript]);

    return (
        <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            
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

            {/* Message History - Fixed Height */}
            <div style={{ 
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                minHeight: 0,
                borderRadius: '10px'
            }}>
                
                {messageHistory.map((message, index) => (
                    <div key={message.id} style={{ 
                        marginBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* User Message - Right Side */}
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginBottom: message.answer ? '8px' : '0'
                        }}>
                            <div style={{ 
                                maxWidth: '70%',
                                padding: '12px 16px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                borderRadius: '18px 18px 4px 18px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                position: 'relative'
                            }}>
                                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                    {message.question}
                                </div>
                                <div style={{ 
                                    fontSize: '10px', 
                                    opacity: 0.8, 
                                    marginTop: '4px',
                                    textAlign: 'right'
                                }}>
                                    {message.timestamp}
                                </div>
                            </div>
                        </div>
                        
                        {/* Agent Response - Left Side */}
                        {message.answer && (
                            <div style={{ 
                                display: 'flex',
                                justifyContent: 'flex-start'
                            }}>
                                <div style={{ 
                                    maxWidth: '70%',
                                    padding: '12px 16px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    borderRadius: '18px 18px 18px 4px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    position: 'relative'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        marginBottom: '4px'
                                    }}>
                                        <span style={{ 
                                            fontSize: '12px', 
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            marginRight: '8px'
                                        }}>
                                            🏦 Banking Assistant
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                        {message.answer}
                                    </div>
                                    <div style={{ 
                                        fontSize: '10px', 
                                        opacity: 0.8, 
                                        marginTop: '4px'
                                    }}>
                                        {message.timestamp}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Footer with Control Buttons */}
            <div style={{ 
                padding: '20px',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
            }}>
                <button 
                    onClick={isRecording ? stopRecording : startRecording} 
                    disabled={isProcessing || isSpeaking}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isRecording ? '#ff4444' : (isSpeaking ? '#cccccc' : '#4CAF50'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: (isProcessing || isSpeaking) ? 'not-allowed' : 'pointer',
                        minWidth: '80px'
                    }}
                >
                    {isRecording ? 'Stop' : (isSpeaking ? 'Spk...' : 'Start')}
                </button>

                {messageHistory.length > 0 && (
                    <button 
                        onClick={clearMessageHistory}
                        disabled={isSpeaking}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isSpeaking ? '#cccccc' : '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: isSpeaking ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default AiAgent;
