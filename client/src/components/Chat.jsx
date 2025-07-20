import { useState, useRef, useEffect } from 'react';
import './Chat.css';
import toast, { Toaster } from 'react-hot-toast';
import { llmRequest, renewTokensRequest } from '../utils/apiRequests';
import { setToken, deleteToken } from '../utils/tokenManager';

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      text: "Hello! How can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [voices, setVoices] = useState([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Set Google US English as default
      const googleVoice = availableVoices.findIndex(voice =>
        voice.name.includes('Google') && voice.lang === 'en-US'
      );
      if (googleVoice !== -1) {
        setSelectedVoice(googleVoice);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

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
      const aiResponse = await llmRequest({ userInput: newMessage.text });
      console.log(aiResponse);
      newAIResponse.text = aiResponse.data || aiResponse.data;
      setMessages(prev => [...prev, newAIResponse]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'An error occurred');
      throw error;
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim()) {
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
        const message = error?.response?.data?.message || 'An error occurred while updating your profile.';
        if (message === 'jwt expired') {
          try {
            await renewTokensRequest();
            toast.success('Session renewed successfully!');

            // Adding new token
            deleteToken();
            setToken();

            // Retry the original request
            processAIRequest(newMessage);
          } catch (renewError) {
            toast.error('Session renewal failed: ' + renewError?.response?.data?.message);
            console.error('Renew Error:', renewError);
          }
          return;
        }

        console.error('Error fetching AI response:', error);
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

  const handleTextToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      if (voices.length > 0 && selectedVoice < voices.length) {
        utterance.voice = voices[selectedVoice];
      }

      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      speechSynthesis.speak(utterance);
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
          handleTextToSpeech(lastMessage.text);
        }, 500);
      }
    }
  }, [messages, voices]);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
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
            <h1 style={{ cursor: 'default' }}>CustomAI</h1>
            <div className="chat-controls">
              <select
                title="Select Voice"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(parseInt(e.target.value))}
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
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  <div className="message-actions">
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                    {message.sender === 'ai' && (
                      <button
                        className="speak-btn"
                        onClick={() => handleTextToSpeech(message.text)}
                        title="Speak this message"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12Z" fill="currentColor" />
                        </svg>
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
                  disabled={!inputText.trim()}
                  title="Send message"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
                  </svg>
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
