import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Key, Thermometer, Cpu, Trash2, Info, Volume2, Headphones } from 'lucide-react';
import { AppSettings } from '../types';
import { cn } from '../lib/utils';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
  onClearChat: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onUpdate, onClose, onClearChat }) => {
  return (
    <div className="flex flex-col h-full bg-[#050505] text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center gap-4 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-xl tracking-tight">Settings</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
        {/* API Key Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Key size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Gemini API Key</h3>
          </div>
          <div className="space-y-2">
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => onUpdate({ ...settings, apiKey: e.target.value })}
              placeholder="Enter your API key..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-blue-500/50 focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-gray-600 px-2 flex justify-between">
              <span>Your API key is stored locally and never shared.</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Get Key
              </a>
            </p>
          </div>
        </section>

        {/* Model Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Cpu size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Model Selection</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'gemini-flash-latest', name: 'Gemini 3 Flash', desc: 'Fast & Efficient' },
              { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', desc: 'Complex Reasoning' },
            ].map((model) => (
              <button
                key={model.id}
                onClick={() => onUpdate({ ...settings, model: model.id })}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                  settings.model === model.id 
                    ? "bg-blue-600/10 border-blue-500/50" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                <div>
                  <p className="text-sm font-bold">{model.name}</p>
                  <p className="text-[10px] text-gray-500">{model.desc}</p>
                </div>
                {settings.model === model.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Temperature */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Thermometer size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Temperature ({settings.temperature})</h3>
          </div>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => onUpdate({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-bold">
              <span>PRECISE</span>
              <span>CREATIVE</span>
            </div>
          </div>
        </section>

        {/* Voice & Read Aloud */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Headphones size={16} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Read Aloud Mode</h3>
            </div>
            <button
              onClick={() => onUpdate({ ...settings, isReadAloudEnabled: !settings.isReadAloudEnabled })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                settings.isReadAloudEnabled ? "bg-blue-600" : "bg-white/10"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                settings.isReadAloudEnabled ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Volume2 size={16} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Voice Speed ({settings.voiceSpeed}x)</h3>
            </div>
            <div className="px-2">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => onUpdate({ ...settings, voiceSpeed: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="pt-4 space-y-3">
          <button
            onClick={onClearChat}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-bold"
          >
            <Trash2 size={18} />
            Clear Chat History
          </button>
          
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-3">
            <Info size={20} className="text-blue-500 shrink-0" />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Emu.ai is an experimental AI client. Ero is designed to be unfiltered and witty. Use with discretion.
            </p>
          </div>
        </section>
      </div>

      <footer className="p-6 text-center">
        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">
          Emu.ai Version 1.0.0
        </p>
        <p className="text-[10px] text-gray-800 font-medium mt-1">
          this apk create by mofiz
        </p>
      </footer>
    </div>
  );
};

export default SettingsScreen;
