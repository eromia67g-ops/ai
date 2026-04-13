import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SplashScreen from './components/SplashScreen';
import ChatScreen from './components/ChatScreen';
import SettingsScreen from './components/SettingsScreen';
import { AppView, Message, AppSettings } from './types';
import { MessageSquare, Mic, Monitor, FileText, Settings as SettingsIcon } from 'lucide-react';
import { cn } from './lib/utils';
import './index.css';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('splash');
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    temperature: 1.0,
    model: 'gemini-flash-latest',
    voiceSpeed: 1.0,
    isReadAloudEnabled: false,
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('emu_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedMessages = localStorage.getItem('emu_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('emu_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('emu_messages', JSON.stringify(messages));
  }, [messages]);

  const renderView = () => {
    switch (view) {
      case 'splash':
        return <SplashScreen onFinish={() => setView('chat')} />;
      case 'chat':
        return (
          <ChatScreen 
            settings={settings} 
            onOpenSettings={() => setView('settings')}
            messages={messages}
            setMessages={setMessages}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            settings={settings} 
            onUpdate={setSettings} 
            onClose={() => setView('chat')}
            onClearChat={() => {
              setMessages([]);
              setView('chat');
            }}
          />
        );
      case 'live':
        return <div className="p-8 text-center">Live Voice Mode (Native Only)</div>;
      case 'screen':
        return <div className="p-8 text-center">Screen Share Mode (Native Only)</div>;
      case 'files':
        return <div className="p-8 text-center">File Analysis Mode</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] font-sans text-white overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation (Desktop Friendly) */}
      {view !== 'splash' && (
        <nav className="h-20 bg-[#0a0a0a]/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center gap-8 md:gap-16 px-6 z-50">
          {[
            { id: 'chat', icon: <MessageSquare size={24} />, label: 'Chat' },
            { id: 'live', icon: <Mic size={24} />, label: 'Live' },
            { id: 'screen', icon: <Monitor size={24} />, label: 'Screen' },
            { id: 'files', icon: <FileText size={24} />, label: 'Files' },
            { id: 'settings', icon: <SettingsIcon size={24} />, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 group",
                view === item.id ? "text-blue-500 scale-110" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                view === item.id ? "bg-blue-500/10" : "group-hover:bg-white/5"
              )}>
                {item.icon}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;
