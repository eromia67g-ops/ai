export type AppView = 'splash' | 'chat' | 'live' | 'screen' | 'files' | 'settings';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: {
    mimeType: string;
    data: string; // base64
    name?: string;
  }[];
}

export interface AppSettings {
  apiKey: string;
  temperature: number;
  model: string;
  voiceSpeed: number;
  isReadAloudEnabled: boolean;
}
