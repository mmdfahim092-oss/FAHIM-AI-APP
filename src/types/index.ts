export type AppState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'SCREEN_CAPTURE_STARTING'
  | 'SCREEN_CAPTURE_ACTIVE'
  | 'IMAGE_ANALYZING'
  | 'ERROR';

export type Language = 'bn' | 'en';

export type NavigationTab =
  | 'home'
  | 'voice'
  | 'screen_vision'
  | 'manual_screen'
  | 'trading_vision'
  | 'camera_scanner'
  | 'coding'
  | 'phone_assistant'
  | 'memory_vault'
  | 'history'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: string;
  type?: 'general' | 'trading' | 'screen' | 'code' | 'camera';
}

export interface Conversation {
  id: string;
  title: string;
  category: NavigationTab;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  category: 'personal' | 'trading' | 'code' | 'preference' | 'system';
  timestamp: number;
}

export interface TradingAnalysis {
  instrumentAndTimeframe: string;
  marketCondition: string;
  trendBias: 'BULLISH' | 'BEARISH' | 'RANGING' | 'UNCLEAR';
  keySupportResistance: string;
  chartEvidence: string;
  scenarioA: string;
  scenarioB: string;
  entryStopTarget: string;
  riskReward: string;
  invalidation: string;
  confidenceLevel: string;
  rawMarkdown: string;
}

export interface SystemStatus {
  micPermission: 'prompt' | 'granted' | 'denied';
  screenPermission: 'ready' | 'active' | 'denied';
  cameraPermission: 'prompt' | 'granted' | 'denied';
  isAiConnected: boolean;
  activeModel: string;
  deviceTarget: string;
}
