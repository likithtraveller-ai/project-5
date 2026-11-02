import React, { useState, useRef, useEffect } from 'react';
import { PersonaType, PERSONAS, ToneType, ResponseLengthType } from '../types/persona';
import { PersonaIcon } from './PersonaIcon';
import { Send, Trash2, CornerDownLeft, Sparkles } from 'lucide-react';

interface MessageInputProps {
  activePersona: PersonaType;
  tone: ToneType;
  length: ResponseLengthType;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
  hasMessages: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  activePersona,
  tone,
  length,
  isLoading,
  onSendMessage,
  onClearChat,
  hasMessages,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const personaData = PERSONAS[activePersona];

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-2">
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800/90 focus-within:border-white/50 focus-within:ring-1 focus-within:ring-white/20 transition-all shadow-sm"
        >
          {/* Active Persona indicator strip inside input */}
          <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1 text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5 font-medium text-neutral-300">
              <PersonaIcon persona={activePersona} className="w-3.5 h-3.5 text-white" />
              <span>Prompting:</span>
              <span className="text-white font-semibold">
                {personaData.name}
              </span>
              <span className="text-neutral-500 hidden sm:inline">
                ({tone}, {length})
              </span>
            </div>

            {hasMessages && (
              <button
                type="button"
                onClick={onClearChat}
                className="text-neutral-500 hover:text-white transition-colors flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded hover:bg-neutral-800"
                title="Clear conversation"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask ${personaData.name} anything... (e.g. explain, code, strategize)`}
            className="w-full bg-transparent px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-hidden resize-none max-h-48 leading-relaxed"
          />

          {/* Bottom Bar: Instructions and Send Button */}
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1 text-[11px] text-neutral-500">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10.5px]">
              Press <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[9.5px] border border-neutral-700">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[9.5px] border border-neutral-700">Shift+Enter</kbd> for newline
            </span>
            <span className="sm:hidden text-[10px]">
              {input.length > 0 ? `${input.length} chars` : ''}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                  input.trim() && !isLoading
                    ? 'bg-white text-black hover:bg-neutral-200 shadow-xs cursor-pointer font-semibold'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>Send</span>
                <Send className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
