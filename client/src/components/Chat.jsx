import { useState, useRef, useEffect, useCallback } from 'react';
import './Chat.css';
import toast, { Toaster } from 'react-hot-toast';
import { llmRequest, renewTokensRequest } from '../utils/apiRequests';
import { getToken, setToken, deleteToken } from '../utils/tokenManager';

function Chat() {
  const userName = useRef((getToken()?.userName?.charAt(0)?.toUpperCase() + getToken()?.userName?.slice(1)) || 'to Custom AI'); // Username with capital first letter
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      text: `Welcome ${userName.current}. What would you like to ask?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [voices, setVoices] = useState([]);
  const [currentSpeakingId, setCurrentSpeakingId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Prevent body scroll on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      }
    }
  }, [isMobile]);

  const scrollToBottom = () => {
    if (isMobile && messagesEndRef.current) {
      // For mobile, use scrollTop to avoid issues with browser UI
      const container = messagesEndRef.current.parentElement;
      setTimeout(() => {
        container.scrollToTop = container.scrollHeight;
      }, 100);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle mobile viewport changes and keyboard
  useEffect(() => {
    if (isMobile) {
      const handleFocus = () => {
        setTimeout(scrollToBottom, 300);
      }

      const handleViewportChange = () => {
        setTimeout(scrollToBottom, 150);
      }

      inputRef.current?.addEventListener('focus', handleFocus);

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewportChange);
      }

      return () => {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
    }
  }, [messages])
  
  // Stop speech when component unmounts or page changes
  useEffect(() => {
    // Add event listener for page navigation
    const handleBeforeUnload = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function when component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Find the best English voice available with improved mobile support
      let bestVoiceIndex = -1;
      
      // First priority: Google US English
      bestVoiceIndex = availableVoices.findIndex(voice =>
        voice.name.includes('Google') && (voice.lang === 'en-US' || voice.lang === 'en_US')
      );
      
      // Second priority: Any native US English voice
      if (bestVoiceIndex === -1) {
        bestVoiceIndex = availableVoices.findIndex(voice =>
          voice.lang === 'en-US' || voice.lang === 'en_US'
        );
      }
      
      // Third priority: Any English voice
      if (bestVoiceIndex === -1) {
        bestVoiceIndex = availableVoices.findIndex(voice =>
          voice.lang.startsWith('en') && !voice.name.includes('as_IN')
        );
      }
      
      // Fourth priority: Any voice that's not Assamese
      if (bestVoiceIndex === -1) {
        bestVoiceIndex = availableVoices.findIndex(voice =>
          !voice.lang.includes('as') && !voice.name.includes('as_IN')
        );
      }

      // If we found a suitable voice, set it as default
      if (bestVoiceIndex !== -1) {
        setSelectedVoice(bestVoiceIndex);
      } else if (availableVoices.length > 0) {
        // Fallback to first available voice
        setSelectedVoice(0);
      }
    };

    // Initial load
    loadVoices();

    // Handle voice loading in different browsers
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        inputRef.current?.focus();
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const processAIRequest = async (newMessage) => {
    const newAIResponse = {
      id: crypto.randomUUID(),
      text: "",
      sender: 'ai',
      timestamp: new Date()
    };

    try {
      const token = getToken();
      if (token === null) {
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/signin';
        deleteToken();
        return;
      }

      const aiResponse = await llmRequest({ userInput: newMessage.text }, token.accessToken);
      newAIResponse.text = aiResponse.data;
      setMessages(prev => [...prev, newAIResponse]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'An error occurred while fetching AI response.');
      throw error;
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() && !isSending) {
      setIsSending(true);
      const newMessage = {
        id: crypto.randomUUID(),
        text: inputText,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setInputText('');

      try {
        // Get AI Response
        await processAIRequest(newMessage);
      } catch (error) {
        const message = error?.response?.data?.message || 'An error occurred while fetching AI response.';
        if (message === 'jwt expired') {
          try {
            const token = getToken();
            if (token === null) {
              toast.error('Session expired. Please sign in again.');
              window.location.href = '/signin';
              deleteToken();
              return;
            }

            // Renew access and refresh tokens
            const response = await renewTokensRequest({ refreshToken: token.refreshToken });
            toast.success('Session renewed successfully!');

            // Adding new token
            deleteToken();
            setToken(response.data.accessToken, response.data.refreshToken, response.data.user.userName, response.data.user.email);

            // Retry the original request
            processAIRequest(newMessage);
          } catch (renewError) {
            toast.error('Session renewal failed: ' + renewError?.response?.data?.message);
            console.error('Renew Error:', renewError);
            window.location.href = '/signin';
          }
          return;
        }

        console.error('Error fetching AI response:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Memoize stopSpeech to ensure consistent reference
  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setCurrentSpeakingId(null);
    }
  }, []);

  const handleTextToSpeech = (text, messageId) => {
    if ('speechSynthesis' in window) {
      try {
        // Stop any ongoing speech
        stopSpeech();
        setCurrentSpeakingId(messageId);

        // Mobile browsers often have issues with long text
        // Use smaller chunks for mobile
        const chunkSize = isMobile ? 100 : 200; // Smaller chunks for mobile
        const textChunks = [];

        // Simple sentence splitting that works in all browsers
        const sentences = text.split(/[.!?]\s+/);
        let currentChunk = '';

        sentences.forEach(sentence => {
          // Add period back to sentence if it was removed by split
          const formattedSentence = sentence.trim() + (sentence.trim().length > 0 ? '. ' : '');

          // If adding this sentence would exceed chunk size, push current chunk and start new one
          if (currentChunk.length + formattedSentence.length > chunkSize) {
            if (currentChunk) textChunks.push(currentChunk);
            currentChunk = formattedSentence;
          } else {
            currentChunk += formattedSentence;
          }
        });

        // Add the last chunk if it exists
        if (currentChunk) textChunks.push(currentChunk);

        // For mobile browsers, we need to handle speech differently
        if (isMobile) {
          // Speak one chunk at a time with manual queue management
          let currentChunkIndex = 0;

          const speakNextChunk = () => {
            if (currentChunkIndex < textChunks.length) {
              const utterance = new SpeechSynthesisUtterance(textChunks[currentChunkIndex]);

              // Make sure voice is valid for this browser
              if (voices.length > 0 && selectedVoice < voices.length) {
                utterance.voice = voices[selectedVoice];

                // Force voice setting on mobile
                utterance.voiceURI = voices[selectedVoice].voiceURI;
                utterance.lang = voices[selectedVoice].lang;
              }

              utterance.rate = 0.9;
              utterance.pitch = 1;
              utterance.volume = 1;

              // When this chunk ends, speak the next one
              utterance.onend = () => {
                currentChunkIndex++;
                if (currentChunkIndex >= textChunks.length) {
                  setCurrentSpeakingId(null);
                } else {
                  speakNextChunk();
                }
              };

              speechSynthesis.speak(utterance);
            }
          };

          // Start speaking the first chunk
          speakNextChunk();
        } else {
          // Desktop browsers can handle multiple utterances in queue
          textChunks.forEach((chunk) => {
            const utterance = new SpeechSynthesisUtterance(chunk);

            if (voices.length > 0 && selectedVoice < voices.length) {
              utterance.voice = voices[selectedVoice];

              // Force voice setting for better compatibility
              utterance.voiceURI = voices[selectedVoice].voiceURI;
              utterance.lang = voices[selectedVoice].lang;
            }

            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Clear speaking message ID when the last utterance ends
            if (chunk === textChunks[textChunks.length - 1]) {
              utterance.onend = () => setCurrentSpeakingId(null);
            }

            speechSynthesis.speak(utterance);
          });
        }
      } catch (error) {
        console.error('Speech synthesis error:', error);
        toast.error('Speech synthesis failed');
      }
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  // Auto-play new AI messages
  useEffect(() => {
    if (messages.length > 1 && voices.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'ai') {
        setTimeout(() => {
          handleTextToSpeech(lastMessage.text, lastMessage.id);
        }, 200);
      }
    }
  }, [messages, voices]);
  
  // Monitor speech synthesis status
  useEffect(() => {
    const handleSpeechEnd = () => {
      if (window.speechSynthesis.pending === false && 
          window.speechSynthesis.speaking === false) {
        setCurrentSpeakingId(null);
      }
    };
    
    // Check speech status periodically
    const interval = setInterval(handleSpeechEnd, 100);
    
    return () => {
      clearInterval(interval);
      // Ensure speech is stopped when this effect is cleaned up
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // State to control mobile menu visibility
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Force voice selection update on mobile
  const handleVoiceChange = (e) => {
    const newVoiceIndex = parseInt(e.target.value);
    setSelectedVoice(newVoiceIndex);
    
    // On mobile, immediately test the voice to ensure it's selected
    if (isMobile && voices.length > 0 && newVoiceIndex < voices.length) {
      try {
        speechSynthesis.cancel(); // Stop any ongoing speech
        
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance('Voice selected');
          utterance.voice = voices[newVoiceIndex];
          utterance.volume = 0.5; // Lower volume for test
          utterance.rate = 1;
          utterance.pitch = 1;
          speechSynthesis.speak(utterance);
        }, 100);
        
        // Close mobile menu after selection
        setShowMobileMenu(false);
      } catch (error) {
        console.error('Error testing voice:', error);
      }
    }
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };
  
  // Handle keyboard shortcuts and close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && showMobileMenu && 
          !event.target.closest('.chat-controls') && 
          !event.target.closest('.menu-toggle-btn')) {
        setShowMobileMenu(false);
      }
    };
    
    const handleKeyDown = (event) => {
      // Focus input when '/' is pressed
      if (event.key === '/' && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, showMobileMenu]);

  return (
    <div className={`chat-page ${isMobile ? 'mobile' : ''}`}>
      <Toaster
        toastOptions={{
          style: {
            background: "#333", // Dark background
            color: "#fff", // White text
          },
        }}
      />
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-title">
            <div className="title-row" style={{ marginTop: isMobile ? '40px' : '0' }}>
              <h1 style={{ cursor: 'default' }}>CustomAI</h1>
              {isMobile && (
                <button 
                  className="menu-toggle-btn" 
                  onClick={toggleMobileMenu}
                  aria-label="Toggle menu"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor" />
                  </svg>
                </button>
              )}
            </div>
            <div className={`chat-controls ${isMobile && showMobileMenu ? 'show' : ''}`}>
              <select
                title="Select Voice"
                value={selectedVoice}
                onChange={handleVoiceChange}
                className="voice-selector"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              <button
                title="Update Profile"
                className="update-btn"
                onClick={() => window.location.href = '/update'}
                style={{ width: isMobile ? '100%' : 'auto' }}
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-container" style={{ marginTop: isMobile ? '40px' : '0' }}>
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <pre>{message.text}</pre>
                  <div className="message-actions">
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                    {message.sender === 'ai' && (
                      <button
                        className={`speak-btn ${currentSpeakingId === message.id ? 'speaking' : ''}`}
                        onClick={() => currentSpeakingId === message.id ? stopSpeech() : handleTextToSpeech(message.text, message.id)}
                        title={currentSpeakingId === message.id ? "Stop" : "Speak this message"}
                      >
                        {currentSpeakingId === message.id ? (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6h12v12H6z" fill="#ff5252" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12Z" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask anything..."
                className="chat-input"
                autoFocus
              />
              <div className="input-actions">
                <button
                  type="button"
                  className={`voice-btn ${isListening ? 'listening' : ''}`}
                  onClick={handleVoiceInput}
                  title="Voice input"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.11 2 14 2.9 14 4V10C14 11.11 13.11 12 12 12C10.89 12 10 11.11 10 10V4C10 2.9 10.89 2 12 2ZM19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19Z" fill="currentColor" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="send-btn"
                  disabled={!inputText.trim() || isSending}
                  title="Send message"
                >
                  {isSending ? (
                    <div className="spinner-white"></div>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
