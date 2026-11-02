import React, { useState } from 'react';
import { PersonaType, PERSONAS } from '../types/persona';
import { PersonaIcon } from './PersonaIcon';
import { User } from 'firebase/auth';
import {
  Bot,
  LogIn,
  LogOut,
  History,
  Plus,
  Download,
  Trash2,
  ChevronDown,
  Sparkles,
  Cloud,
} from 'lucide-react';

interface NavbarProps {
  activePersona: PersonaType;
  onSelectPersona: (p: PersonaType) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onNewChat: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  onExportChat: () => void;
  hasMessages: boolean;
  onTogglePersonaBar: () => void;
  showPersonaBar: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePersona,
  onSelectPersona,
  user,
  onLogin,
  onLogout,
  onNewChat,
  onToggleHistory,
  historyCount,
  onExportChat,
  hasMessages,
  onTogglePersonaBar,
  showPersonaBar,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const activePersonaData = PERSONAS[activePersona];

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          {/* History drawer button */}
          <button
            onClick={onToggleHistory}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors relative"
            title="Conversation History"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            title="Start New Conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {/* App Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  Persona Prompt Bot
                </h1>
                <span className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 hidden sm:block">
                Adaptive Multi-Persona AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Persona Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePersonaBar}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:text-white transition-all shadow-xs"
            title="Toggle Persona Cards"
          >
            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
              <PersonaIcon persona={activePersona} className="w-3 h-3" />
            </div>
            <span className="font-semibold text-white">
              {activePersonaData.name}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-neutral-400 transition-transform ${
                showPersonaBar ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Right: Actions and User Auth */}
        <div className="flex items-center gap-2">
          {/* Export button */}
          {hasMessages && (
            <button
              onClick={onExportChat}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
              title="Export Conversation as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* User Sign In / Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-white text-black text-xs font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-neutral-300 max-w-[100px] truncate hidden md:inline">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400 hidden sm:inline" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-800 p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-neutral-800 text-xs">
                    <p className="font-semibold text-white truncate">
                      {user.displayName || 'Authenticated User'}
                    </p>
                    <p className="text-neutral-400 text-[11px] truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1 font-mono">
                      <Cloud className="w-3 h-3 text-white" />
                      <span>Cloud Sync to Firestore: Active</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-neutral-800/80 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-all shadow-xs"
              title="Sign in with Google to sync conversations"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In with Google</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
