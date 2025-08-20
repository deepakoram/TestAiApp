import React, { useState, useEffect, useRef } from 'react';

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsRecording(true);
        setIsListening(true);
        finalTranscriptRef.current = '';
        setTranscript('');
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Store final transcript in ref
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }

        setTranscript(finalTranscriptRef.current + interimTranscript);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
        setIsListening(false);
        
        // Send the final transcript if it exists
        const finalText = finalTranscriptRef.current.trim();
        if (finalText) {
          handleSendMessage(finalText);
        }
        
        // Reset transcript
        setTranscript('');
        finalTranscriptRef.current = '';
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsListening(false);
        setTranscript('');
        finalTranscriptRef.current = '';
      };

      setRecognition(recognitionInstance);
    }
  }, []); // Remove transcript dependency

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startListening = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
        setIsRecording(false);
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
        setIsRecording(false);
      }
    }
  };

  const cancelListening = () => {
    if (recognition) {
      try {
        recognition.abort();
      } catch (error) {
        console.error('Error aborting recognition:', error);
      }
    }
    setIsListening(false);
    setIsRecording(false);
    setTranscript('');
    finalTranscriptRef.current = '';
  };

  const switchToChat = () => {
    if (isListening) {
      cancelListening();
    }
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('music') || input.includes('playlist') || input.includes('play')) {
      return {
        type: 'suggestions',
        text: 'Quick reply suggestions',
        options: [
          { icon: '🎵', label: 'Lofi Beats' },
          { icon: '🎧', label: 'Nature & Ambient Sounds' },
          { icon: '🔥', label: 'Motivational & Classical' }
        ]
      };
    }
    
    if (input.includes('image') || input.includes('generate')) {
      return {
        type: 'suggestions',
        text: 'I can help you generate images!',
        options: [
          { icon: '🎨', label: 'Creative illustrations' },
          { icon: '🌅', label: 'Landscape photos' },
          { icon: '🎭', label: 'Abstract art' }
        ]
      };
    }

    return {
      type: 'text',
      text: 'I understand you said: "' + userInput + '". How can I help you with that?'
    };
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      handleSendMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-black text-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {isListening ? (
          // Listening State
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="relative mb-8">
              {/* Animated listening circle */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-teal-400 to-green-400 animate-pulse flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-black animate-ping"></div>
              </div>
              {/* Sound waves */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-teal-400 rounded-full animate-pulse"
                      style={{
                        height: `${20 + i * 8}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-xl font-medium mb-6">Podia is listening..</p>
            
            {transcript && (
              <div className="bg-gray-800 rounded-2xl p-4 max-w-sm w-full">
                <p className="text-white">{transcript}</p>
              </div>
            )}
          </div>
        ) : (
          // Chat Interface
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-400 to-green-400 mr-2"></div>
                      </div>
                    )}
                    
                    {typeof message.content === 'object' ? (
                      <div>
                        <p className="mb-3">{message.content.text}</p>
                        {message.content.type === 'suggestions' && (
                          <div className="space-y-2">
                            {message.content.options.map((option, index) => (
                              <button
                                key={index}
                                className="w-full text-left p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center"
                              >
                                <span className="mr-2">{option.icon}</span>
                                <span>{option.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end mt-3">
                          <button className="text-xs text-gray-400 hover:text-white">
                            Share
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    
                    {message.type === 'ai' && (
                      <div className="flex space-x-2 mt-2">
                        <button className="text-xs text-gray-400 hover:text-white">Copy</button>
                        <button className="text-xs text-gray-400 hover:text-white">Share</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controls - Fixed to footer */}
      <div className="border-t border-gray-700 p-4 bg-gradient-to-b from-green-900 to-black">
        {isListening ? (
          // Recording Controls
          <div className="flex items-center justify-center space-x-8">
            <button 
              onClick={switchToChat}
              className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            
            <button
              onClick={stopListening}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center animate-pulse hover:from-teal-500 hover:to-green-500 transition-all"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <button 
              onClick={cancelListening}
              className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          // Text Input
          <form onSubmit={handleTextSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 rounded-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            
            <button 
              type="submit"
              className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={startListening}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center hover:from-teal-500 hover:to-green-500 transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SpeechToText;