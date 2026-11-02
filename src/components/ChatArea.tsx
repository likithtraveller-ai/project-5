import React, { useRef, useEffect } from 'react';
import {
  ChatMessage,
  PersonaType,
  PERSONAS,
  ToneType,
  ResponseLengthType,
} from '../types/persona';
import { PersonaIcon } from './PersonaIcon';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Copy,
  Check,
  Globe,
  ExternalLink,
  Brain,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react';

interface ChatAreaProps {
  messages: ChatMessage[];
  activePersona: PersonaType;
  tone: ToneType;
  length: ResponseLengthType;
  isLoading: boolean;
  error: string | null;
  onSelectPrompt: (prompt: string) => void;
  onRetry: () => void;
  onSwitchPersona: (persona: PersonaType) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  activePersona,
  tone,
  length,
  isLoading,
  error,
  onSelectPrompt,
  onRetry,
  onSwitchPersona,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const activePersonaData = PERSONAS[activePersona];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, error]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Empty state / Welcome Hero */}
        {messages.length === 0 && (
          <div className="py-8 sm:py-12 px-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 mb-4 shadow-inner">
              <PersonaIcon persona={activePersona} className="w-7 h-7 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-400 mb-3">
              <span>Active Persona:</span>
              <span className="text-white font-semibold">
                {activePersonaData.name}
              </span>
              <span>•</span>
              <span className="capitalize">{tone}</span>
              <span>•</span>
              <span className="capitalize">{length}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              {activePersonaData.tagline}
            </h2>
            <p className="mt-2 text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              {activePersonaData.description} Select a starter prompt below or
              type your own request to begin.
            </p>

            {/* Prompt Starter Chips */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto text-left">
              {activePersonaData.samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(prompt)}
                  className="group p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:bg-neutral-800/60 hover:border-neutral-700 transition-all duration-150 flex items-start justify-between gap-3"
                >
                  <span className="text-xs text-neutral-300 group-hover:text-white leading-relaxed line-clamp-2">
                    {prompt}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>

            {/* Other Personas quick switch row */}
            <div className="mt-8 pt-6 border-t border-neutral-800/60 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500">
              <span>Switch persona anytime:</span>
              {(['TEACHER', 'MARKETER', 'DEVELOPER', 'RECRUITER', 'CONSULTANT'] as PersonaType[])
                .filter((p) => p !== activePersona)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => onSwitchPersona(p)}
                    className="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors inline-flex items-center gap-1 text-[11px]"
                  >
                    <PersonaIcon persona={p} className="w-3 h-3" />
                    <span>{PERSONAS[p].name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const msgPersona = PERSONAS[message.persona] || activePersonaData;
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const personaChanged =
            !isUser && prevMsg && prevMsg.persona !== message.persona;

          return (
            <div key={message.id} className="space-y-2">
              {/* Persona switch notification in stream if persona changed */}
              {personaChanged && (
                <div className="flex items-center justify-center my-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
                    <PersonaIcon persona={message.persona} className="w-3 h-3 text-white" />
                    <span>Persona switched to</span>
                    <strong className="text-white font-medium">
                      {msgPersona.name}
                    </strong>
                  </div>
                </div>
              )}

              <div
                className={`flex gap-3 sm:gap-4 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* AI Persona Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <PersonaIcon persona={message.persona} className="w-4 h-4" />
                  </div>
                )}

                {/* Message Content Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 transition-all ${
                    isUser
                      ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm rounded-tr-xs'
                      : 'bg-neutral-950/80 text-neutral-200 border border-neutral-800/90 rounded-tl-xs'
                  }`}
                >
                  {/* Header info */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] text-neutral-500 pb-1 border-b border-neutral-800/40">
                    <div className="flex items-center gap-1.5 font-medium">
                      {isUser ? (
                        <>
                          <User className="w-3 h-3" />
                          <span>You</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white font-semibold">
                            {msgPersona.name}
                          </span>
                          <span className="text-neutral-500">
                            • {msgPersona.badge}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {message.modelUsed && (
                        <span className="font-mono text-[10px] text-neutral-500 hidden sm:inline">
                          {message.modelUsed.replace('gemini-', '')}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="text-neutral-500 hover:text-white p-0.5 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  {isUser ? (
                    <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap text-neutral-100">
                      {message.content}
                    </p>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}

                  {/* Search Grounding Citations */}
                  {message.groundingSources &&
                    message.groundingSources.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-neutral-800/80 text-xs">
                        <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-1.5">
                          <Globe className="w-3.5 h-3.5 text-neutral-300" />
                          <span>Grounding Sources (Google Search):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.groundingSources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors max-w-[220px]"
                            >
                              <span className="truncate">{source.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 text-neutral-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4 justify-start items-start">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 mt-0.5 animate-pulse">
              <PersonaIcon persona={activePersona} className="w-4 h-4" />
            </div>

            <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-neutral-950/80 border border-neutral-800/90 text-neutral-300 text-xs flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-white animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-white animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
              <span className="text-neutral-400 font-mono text-[11.5px]">
                {activePersonaData.name} is thinking and formulating response...
              </span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/60 text-red-200 text-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">
                  Failed to generate response
                </p>
                <p className="text-red-400/90 mt-0.5 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/70 border border-red-700/50 text-white font-medium transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
