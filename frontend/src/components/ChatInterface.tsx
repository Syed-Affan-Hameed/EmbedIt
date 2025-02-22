import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, X } from 'lucide-react';
import axios from "axios";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  citations?: string[];
  fileName?: string;
}

interface AIResponse {
  text: string;
  citations?: string[];
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date(),
      fileName: file ? file.name : undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await handleFileUpload(e);

    try {
      const response = await fetch('http://localhost:5009/api/v1/embedit/askQuestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      let aiResponse: AIResponse;
      try {
        aiResponse = typeof data.assistantResponse === 'object' 
          ? data.assistantResponse
          : JSON.parse(data.assistantResponse);
      } catch (e) {
        aiResponse = {
          text: String(data.assistantResponse),
          citations: []
        };
      }

      const botMessage: Message = {
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        citations: aiResponse.citations
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessages(prev => [...prev, { text: "Error processing request.", isUser: false, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log("Form Data: ", formData);

    try {
      const response = await axios.post("http://localhost:5009/api/v1/embedit/uploadContextFiles", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      
      if (response.data.success) {
        console.log("Success uploading file:", response.data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Chat Assistant</h2>
        <p className="text-sm text-gray-500">Ask questions about your documents</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-start max-w-[80%] space-x-2">
              <div className={`p-1 rounded-full ${message.isUser ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {message.isUser ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-gray-600" />}
              </div>
              <div className={`p-3 rounded-lg ${message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div>{message.text}</div>
                {message.fileName && (
                  <div className="text-xs text-white mt-1 underline">📎 {message.fileName}</div>
                )}
                {message.citations && message.citations.map((citation, i) => (
                  <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 mt-1">{citation}</div>
                ))}
                <span className="text-xs opacity-75 block mt-2">{message.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        {file && (
          <div className="flex items-center p-2 mb-2 bg-gray-200 rounded-md text-sm text-gray-700">
            📎 {file.name}
            <button className="ml-2 text-red-500" onClick={() => setFile(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            disabled={isLoading}
          />
          <label htmlFor="fileInput" className="cursor-pointer text-gray-500 hover:text-gray-700">
            <Paperclip className="w-5 h-5 mt-2" />
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={handleContextFileChange}
              accept=".pdf,.txt,.docx,.json"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
