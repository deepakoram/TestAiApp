import React, { useState, useRef, useEffect } from 'react';
import mic_icon from '../assets/mic.svg';
// import mute_icon from '../assets/mute.svg';
import volume_mute_icon from '../assets/volume_mute.svg';
import cross_icon from '../assets/cross.svg';
import Itro from './Itro';

const AiAgent = () => {
    //  State to manage recording status and transcribed text
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messageHistory, setMessageHistory] = useState([]); // Store conversation history
    const [isAgentResponding, setIsAgentResponding] = useState(false); // Loading state for agent response
    const [isMuted, setIsMuted] = useState(false); // Mute state
    const [isTransportReady, setIsTransportReady] = useState(false); // State for gradient ready effect
    const [isToolCallInProgress, setIsToolCallInProgress] = useState(false); // State for tool calling effect
    const audioChunks = useRef([]); //  Buffer to store audio data
    const mediaRecorderRef = useRef(null); // Reference for MediaRecorder
    const streamRef = useRef(null); // Reference for the audio stream
    const speechRef = useRef(null); // Reference for speech synthesis
    const messagesEndRef = useRef(null); // Reference for auto-scroll
    const liveGradientRef = useRef(null); // Reference for live gradient div
    console.log(transcript, 'transcript');

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageHistory]);

    // Effect to control gradient states based on component state
    useEffect(() => {
        // Set transport ready when component is mounted and ready
        setIsTransportReady(true);
        
        // Set tool calling state when processing or agent is responding
        setIsToolCallInProgress(isProcessing || isAgentResponding);
    }, [isProcessing, isAgentResponding]);

    // Banking Q&A Database
    const bankingQA = [
        {
            keywords: ['balance', 'account balance', 'how much', 'money', 'funds'],
            question: 'What is my account balance?',
            answer: 'Your current account balance is ₹2,45000.75. This includes your checking account with ₹1,2000.50 and savings account with $1,250.25.'
        },
        {
            keywords: ['transaction', 'transaction status', 'payment', 'transfer', 'pending'],
            question: 'What is my transaction status?',
            answer: 'Your recent transaction of ₹1500.00 to Amazon.com is still pending and should be processed within 1-2 business days. Your previous transaction of ₹750.50 to Starbucks has been completed successfully.'
        },
        {
            keywords: ['card', 'debit card', 'credit card', 'card status', 'blocked'],
            question: 'Is my card working?',
            answer: 'Your debit card is active and working normally. There are no restrictions or blocks on your account. You can use it for purchases and ATM withdrawals.'
        },
        {
            keywords: ['deposit', 'deposited', 'when', 'clear', 'available'],
            question: 'When will my deposit be available?',
            answer: 'Your deposit of ₹50000.00 made today will be available in your account by tomorrow morning at 9 AM. Standard deposits typically clear within 1 business day.'
        },
        {
            keywords: ['withdraw', 'withdrawal', 'atm', 'cash', 'limit'],
            question: 'What is my withdrawal limit?',
            answer: 'Your daily ATM withdrawal limit is ₹5000.00, and your daily purchase limit is ₹12,000.00. You can increase these limits by contacting customer service.'
        },
        {
            keywords: ['interest', 'rate', 'savings', 'apy', 'earnings'],
            question: 'What is my interest rate?',
            answer: 'Your savings account currently earns 2.5% APY. You earned ₹150.75 in interest this month. Your checking account earns 0.1% APY on balances over ₹1,000.'
        },
        {
            keywords: ['fee', 'charges', 'monthly fee', 'service charge'],
            question: 'Are there any fees on my account?',
            answer: 'You have no monthly maintenance fees on your account. Your last transaction fee was ₹3.50 for an out-of-network ATM withdrawal on March 15th.'
        },
        {
            keywords: ['statement', 'monthly statement', 'bill', 'invoice'],
            question: 'When is my statement available?',
            answer: 'Your monthly statement will be available online on the 1st of each month. Your current statement period ends on the 31st, and the new statement will be ready on the 1st.'
        },
        {
            keywords: ['loan', 'mortgage', 'payment', 'due date', 'installment'],
            question: 'When is my loan payment due?',
            answer: 'Your mortgage payment of ₹1,25000.00 is due on the 15th of each month. Your next payment is due in 8 days. You can make early payments through the mobile app.'
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

    // Function to get default response when no banking answer is found
    const getDefaultResponse = (transcript) => {
        const lowerTranscript = transcript.toLowerCase();
        
        // Check for common non-banking phrases and provide appropriate responses
        if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi') || lowerTranscript.includes('hey')) {
            return "Hello! I'm your AI banking assistant. How can I help you with your banking needs today? You can ask me about your account balance, transactions, card status, and more.";
        }
        
        if (lowerTranscript.includes('thank') || lowerTranscript.includes('thanks')) {
            return "You're welcome! I'm here to help with all your banking questions. Feel free to ask me anything about your accounts, transactions, or banking services.";
        }
        
        if (lowerTranscript.includes('bye') || lowerTranscript.includes('goodbye')) {
            return "Goodbye! Thank you for using our AI banking assistant. Have a great day!";
        }
        
        if (lowerTranscript.includes('help') || lowerTranscript.includes('what can you do')) {
            return "I can help you with various banking tasks! You can ask me about your account balance, transaction status, card information, deposit availability, withdrawal limits, interest rates, account fees, statement availability, loan payments, and account security. Just ask me any banking-related question!";
        }
        
        // Default response for unrecognized questions
        return "I understand you said: '" + transcript + "'. I'm specifically designed to help with banking-related questions. You can ask me about your account balance, transactions, card status, deposits, withdrawals, interest rates, fees, statements, loans, or account security. How can I assist you with your banking needs?";
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
    const speakTranscript = async (textToSpeak = null, onStartSpeaking = () => {}) => {
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
                let errorMessage = 'Unknown error occurred';
                
                // Handle specific error codes
                if (response.status === 500) {
                    errorMessage = 'ElevenLabs service is temporarily unavailable. Please try again in a few moments.';
                } else if (response.status === 503) {
                    errorMessage = 'ElevenLabs service is under maintenance. Please try again later.';
                } else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
                } else if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your ElevenLabs API configuration.';
                } else if (response.status === 400) {
                    errorMessage = 'Invalid request. Please check your input and try again.';
                } else if (response.status >= 500) {
                    errorMessage = 'ElevenLabs server error. Our team has been notified. Please try again shortly.';
                } else {
                    errorMessage = `ElevenLabs API error (${response.status}): ${errorData}`;
                }
                
                throw new Error(errorMessage);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const audio = new Audio(audioUrl);
            
            // Set volume based on mute state
            audio.volume = isMuted ? 0 : 1;
            
            audio.onended = () => {
                setIsSpeaking(false);
                speechRef.current = null;
                URL.revokeObjectURL(audioUrl); // Clean up the URL
            };
            
            audio.onerror = (error) => {
                console.error('Audio playback error:', error);
                setIsSpeaking(false);
                speechRef.current = null;
                setError('Audio playback failed. Please try again.');
                URL.revokeObjectURL(audioUrl);
            };
            
            speechRef.current = audio;
            await audio.play();
            onStartSpeaking(); // Call the callback when speech starts
            
        } catch (error) {
            console.error('Error with ElevenLabs TTS:', error);
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setError('Network error: Unable to connect to ElevenLabs. Please check your internet connection and try again.');
            } else if (error.message.includes('timeout')) {
                setError('Request timeout: ElevenLabs service is taking longer than expected. Please try again.');
            } else {
                setError(error.message);
            }
            
            setIsSpeaking(false);
            
            // Show the message even if TTS fails
            onStartSpeaking();
        }
    };

    // Mute toggle function
    const toggleMute = () => {
        setIsMuted(!isMuted);
        
        // If currently speaking, update the volume immediately
        if (speechRef.current) {
            speechRef.current.volume = !isMuted ? 0 : 1;
        }
    };

    // Stop speaking function
    // const stopSpeaking = () => {
    //     if (speechRef.current) {
    //         speechRef.current.pause();
    //         speechRef.current.currentTime = 0;
    //         setIsSpeaking(false);
    //         speechRef.current = null;
    //     }
    // };

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
                let errorMessage = 'Unknown error occurred';
                
                // Handle specific error codes for STT
                if (response.status === 500) {
                    errorMessage = 'Speech recognition service is temporarily unavailable. Please try again in a few moments.';
                } else if (response.status === 503) {
                    errorMessage = 'Speech recognition service is under maintenance. Please try again later.';
                } else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
                } else if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your ElevenLabs API configuration.';
                } else if (response.status === 400) {
                    errorMessage = 'Invalid audio format. Please try recording again.';
                } else if (response.status >= 500) {
                    errorMessage = 'Speech recognition server error. Please try again shortly.';
                } else {
                    errorMessage = `Speech recognition error (${response.status}): ${errorData}`;
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (data.text) {
                setTranscript(data.text); //  Update the transcript state with the received text
                console.log("ElevenLabs transcription:", data.text);
            } else {
                setError('No speech detected. Please try speaking more clearly or check your microphone.');
            }
        } catch (error) {
            console.error('Error sending audio to ElevenLabs:', error);
            
            // Handle network errors for STT
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setError('Network error: Unable to connect to speech recognition service. Please check your internet connection and try again.');
            } else if (error.message.includes('timeout')) {
                setError('Request timeout: Speech recognition is taking longer than expected. Please try again.');
            } else {
                setError(error.message);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (transcript) {
            // Check if transcript contains banking-related questions
            const bankingAnswer = findBankingAnswer(transcript);
            const timestamp = new Date().toLocaleString();
            
            // Add to message history immediately
            addToMessageHistory(transcript, null, timestamp);
            
            // Show loading state
            setIsAgentResponding(true);
            
            // Add a longer delay for more natural conversation flow
            setTimeout(() => {
                if (bankingAnswer) {
                    // Start speaking first, then show message when speech starts
                    speakTranscript(bankingAnswer, () => {
                        // Callback when speech starts - show the message
                        setMessageHistory(prev => 
                            prev.map(msg => 
                                msg.timestamp === timestamp 
                                    ? { ...msg, answer: bankingAnswer, isBankingQuestion: true }
                                    : msg
                            )
                        );
                        setIsAgentResponding(false);
                    });
                } else {
                    // Get default response
                    const defaultResponse = getDefaultResponse(transcript);
                    
                    // Start speaking first, then show message when speech starts
                    speakTranscript(defaultResponse, () => {
                        // Callback when speech starts - show the message
                        setMessageHistory(prev => 
                            prev.map(msg => 
                                msg.timestamp === timestamp 
                                    ? { ...msg, answer: defaultResponse, isBankingQuestion: false }
                                    : msg
                            )
                        );
                        setIsAgentResponding(false);
                    });
                }
            }, 1500); // 1.5 second delay for more natural conversation flow
        }
    }, [transcript]);

    return (
        <div style={{ 
            width: '100%', 
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
        }}>
            <style>
                {`
                    @keyframes pulse {
                        0%, 80%, 100% {
                            opacity: 0.3;
                            transform: scale(0.8);
                        }
                        40% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}
            </style>
            
            {/* {isProcessing && (
                <div style={{ marginBottom: '10px', color: '#2196F3' }}>
                    Processing audio...
                </div>
            )} */}
            
            
            {error && (
                <div style={{ marginBottom: '10px', color: '#f44336', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px' }}>
                    {error}
                </div>
            )}
            {messageHistory.length === 0 ? 
                <Itro/>
                :
                <></>
            }

            {/* Message History - Fixed Height */}
            {messageHistory.length > 0 &&              
            <div style={{ 
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                // backgroundColor: '#f5f5f5',
                minHeight: 0,
                borderRadius: '10px',
                overflow: 'scroll'
                
            }}>
               
               
                {messageHistory.map((message) => (
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
                                backgroundColor: '#1364ff',
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
                                    backgroundColor: '#1B2339',
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
                
               
                
                {/* Loading Indicator */}
                {isAgentResponding && (
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginBottom: '20px'
                    }}>
                        <div style={{ 
                            maxWidth: '70%',
                            padding: '12px 16px',
                            backgroundColor: '#1B2339',
                            color: 'white',
                            borderRadius: '18px 18px 18px 4px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                fontSize: '14px'
                            }}>
                                <span>Fetching results</span>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '2px'
                                }}>
                                    <div style={{ 
                                        width: '4px', 
                                        height: '4px', 
                                        backgroundColor: 'white', 
                                        borderRadius: '50%',
                                        animation: 'pulse 1.4s ease-in-out infinite both'
                                    }}></div>
                                    <div style={{ 
                                        width: '4px', 
                                        height: '4px', 
                                        backgroundColor: 'white', 
                                        borderRadius: '50%',
                                        animation: 'pulse 1.4s ease-in-out infinite both 0.2s'
                                    }}></div>
                                    <div style={{ 
                                        width: '4px', 
                                        height: '4px', 
                                        backgroundColor: 'white', 
                                        borderRadius: '50%',
                                        animation: 'pulse 1.4s ease-in-out infinite both 0.4s'
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>}
            
            {/* Footer with Control Buttons */}
            <div style={{ 
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'end',
                gap: '10px',
                backgroundColor: '#010823',
                // height:"150px",
                // background: 'linear-gradient(to bottom, #010823, #1364ff)'

            }}>
                <button 
                    onClick={toggleMute} 
                    style={{
                        padding: '10px 20px',
                        backgroundColor: (isMuted ? '#cccccc' : '#1B2339'),
                        color: 'white',
                        border: 'none',
                        borderRadius: 50,
                        cursor: 'pointer',
                        width: '55px',
                        height: '55px'
                    }}
                >
                    <img src={volume_mute_icon} alt="mic" style={{ width: '20px', height: '20px' }} />    
                </button>

                <button 
                    onClick={isRecording ? stopRecording : startRecording} 
                    disabled={isProcessing || isSpeaking}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isRecording ?'#1364ff'  : (isSpeaking ? '#cccccc' : '#1B2339'),
                        color: 'white',
                        border: 'none',
                        borderRadius: 50,
                        cursor: (isProcessing || isSpeaking) ? 'not-allowed' : 'pointer',
                        width: '65px',
                        height: '65px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isRecording ? <img src={mic_icon} alt="mic" style={{ width: '20px', height: '20px' }} /> : (isSpeaking ? <img src={mic_icon} alt="mic" style={{ width: '20px', height: '20px' }} /> : 
                        <img src={mic_icon} alt="mic" style={{ width: '20px', height: '20px' }} />
                        )}
                </button>

                {/* {messageHistory.length > 0 && ( */}
                    <button 
                        onClick={clearMessageHistory}
                        disabled={isSpeaking}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isSpeaking ? '#cccccc' : '#1B2339',
                            color: 'white',
                            border: 'none',
                            borderRadius: 50,
                            cursor: isSpeaking ? 'not-allowed' : 'pointer',
                            width: '55px',
                            height: '55px'
                        }}
                    >
                        <img src={cross_icon} alt="cross" style={{ width: '20px', height: '20px' }} />
                    </button>
                {/* )} */}
            </div>
            
            {/* Live Gradient Effect */}
            <div
                ref={liveGradientRef}
                className={`fixed bottom-[-110px] left-1/2 transform -translate-x-1/2 w-[150%] h-[370px] transition-all duration-150 ease-out z-[1] pointer-events-none blur-[30px] opacity-40 ${
                    isTransportReady ? 'opacity-100' : 'opacity-40'
                } ${
                    isToolCallInProgress ? 'before:opacity-100' : 'before:opacity-0'
                }`}
                style={{
                    background: isTransportReady 
                        ? 'radial-gradient(ellipse at bottom, #1364ff 0%, transparent 70%)'
                        : 'radial-gradient(ellipse at bottom, #010823 0%, transparent 80%)'
                }}
            >
                <div 
                    className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                    style={{
                        background: 'radial-gradient(ellipse at bottom, #010823 0%, transparent 70%)',
                        opacity: isToolCallInProgress ? 1 : 0
                    }}
                ></div>
            </div>
        </div>
    );
};

export default AiAgent;
