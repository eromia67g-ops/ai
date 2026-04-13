import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Settings, Trash2, Bot, User, Sparkles, Mic, Headphones, Paperclip, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, AppSettings } from '../types';
import { getChatResponseStream } from '../lib/gemini';
import { cn } from '../lib/utils';

interface ChatScreenProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ settings, onOpenSettings, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [attachments, setAttachments] = useState<{ mimeType: string; data: string; name: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false
      });
      screenStreamRef.current = stream;
      setIsSharingScreen(true);

      // Capture a frame immediately as an attachment
      captureScreenFrame();

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsSharingScreen(false);
  };

  const captureScreenFrame = () => {
    if (!screenStreamRef.current) return;

    const video = document.createElement('video');
    video.srcObject = screenStreamRef.current;
    video.play();

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Wait a bit for the video to actually render
      setTimeout(() => {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        
        setAttachments(prev => [...prev, {
          mimeType: 'image/jpeg',
          data: base64,
          name: `Screen Share ${new Date().toLocaleTimeString()}`
        }]);
        
        video.pause();
        video.srcObject = null;
      }, 500);
    };
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Limit to 4MB
      if (file.size > 4 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 4MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          mimeType: file.type,
          data: base64,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim() || (attachments.length > 0 ? "Analyzed the attached file(s)." : ""),
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, botMessage]);

    try {
      await getChatResponseStream([...messages, userMessage], settings, (text) => {
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, text } : m
        ));
      });
    } catch (error: any) {
      setMessages(prev => prev.map(m => 
        m.id === botMessageId ? { ...m, text: `Error: ${error.message || 'Something went wrong.'}` } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <Bot size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Emu</h2>
            <div className="flex items-center gap-1.5">
              {isLoading ? (
                <>
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <div 
                        key={i} 
                        className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" 
                        style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Typing...</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Online</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMessages([])}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500"
          >
            <Trash2 size={20} />
          </button>
          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Sparkles size={48} className="text-blue-500" />
            <div>
              <p className="text-xl font-medium">Hello, I'm Emu.</p>
              <p className="text-sm">Ask me anything. I don't hold back.</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            if (msg.role === 'model' && !msg.text && !msg.attachments) return null;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white/5 border border-white/10 rounded-tl-none"
                )}>
                  <div className="flex items-center gap-2 mb-1 opacity-50">
                    {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {msg.role === 'user' ? 'You' : 'Emu'}
                    </span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="relative group">
                            {att.mimeType.startsWith('image/') ? (
                              <img 
                                src={`data:${att.mimeType};base64,${att.data}`} 
                                alt={att.name} 
                                className="w-32 h-32 object-cover rounded-lg border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="bg-white/10 px-3 py-2 rounded-lg text-[10px] flex items-center gap-2">
                                <FileText size={14} />
                                <span className="truncate max-w-[100px]">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  <div className="mt-1 text-[9px] opacity-30 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                ))}
              </div>
              {messages[messages.length - 1]?.text === '' && (
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Emu is thinking</span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 px-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative">
                {att.mimeType.startsWith('image/') ? (
                  <img 
                    src={`data:${att.mimeType};base64,${att.data}`} 
                    className="w-16 h-16 object-cover rounded-lg border border-blue-500/30" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="bg-blue-600/20 border border-blue-500/30 px-2 py-2 rounded-lg text-[10px] flex items-center gap-2">
                    <FileText size={12} />
                    <span className="truncate max-w-[60px]">{att.name}</span>
                  </div>
                )}
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-lg"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mb-3 px-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            multiple
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <button 
            onClick={isSharingScreen ? stopScreenShare : startScreenShare}
            className={cn(
              "p-2 rounded-xl transition-colors flex items-center gap-2",
              isSharingScreen ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-white/5 text-gray-400 hover:text-white"
            )}
          >
            <Bot size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isSharingScreen ? "Stop Share" : "Share Screen"}
            </span>
          </button>
          <div className="flex-1" />
          <button 
            onClick={() => onOpenSettings()}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
              settings.isReadAloudEnabled ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-gray-500"
            )}
          >
            <Headphones size={14} />
            পড়া শোনা মোড
          </button>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-blue-500/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm placeholder:text-gray-600"
          />
          {(input.trim() || attachments.length > 0) ? (
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Send size={20} />
            </button>
          ) : (
            <button
              onClick={toggleListening}
              className={cn(
                "p-2.5 rounded-xl transition-all active:scale-95",
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
