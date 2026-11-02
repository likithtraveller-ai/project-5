import React from 'react';
import { SessionData, PERSONAS } from '../types/persona';
import { PersonaIcon } from './PersonaIcon';
import { X, Plus, Trash2, MessageSquare, Clock, Cloud } from 'lucide-react';
import { User } from 'firebase/auth';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionData[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
  user: User | null;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  user,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-neutral-950 border-r border-neutral-800 h-full flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Chat History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3 border-b border-neutral-800/80">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Start New Conversation</span>
          </button>
        </div>

        {/* Sync Status Info */}
        <div className="px-4 py-2 bg-neutral-900/50 text-[11px] text-neutral-400 flex items-center gap-1.5 border-b border-neutral-800/50">
          <Cloud className="w-3.5 h-3.5 text-neutral-300" />
          <span>
            {user
              ? `Synced with Firestore (${user.email})`
              : 'Saved locally. Sign in to sync across devices.'}
          </span>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4 text-neutral-500 text-xs">
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>No saved conversations yet.</p>
              <p className="mt-1 text-[11px] text-neutral-600">
                Your conversations will appear here automatically.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const persona = PERSONAS[session.persona] || PERSONAS.TEACHER;
              const msgCount = session.messages.length;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive
                      ? 'bg-neutral-900 border-white/60 shadow-xs'
                      : 'bg-neutral-950/80 border-neutral-800/60 hover:bg-neutral-900/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-neutral-800 text-white flex items-center justify-center shrink-0">
                        <PersonaIcon persona={session.persona} className="w-3 h-3" />
                      </div>
                      <p className="text-xs font-medium text-white truncate">
                        {session.title || 'Untitled Session'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1 rounded transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[10.5px] text-neutral-500">
                    <span className="text-neutral-400 font-mono">
                      {persona.name}
                    </span>
                    <span>•</span>
                    <span>{msgCount} messages</span>
                    <span>•</span>
                    <span className="capitalize">{session.tone}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
