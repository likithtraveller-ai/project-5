import React from 'react';
import { PersonaType, PERSONAS } from '../types/persona';
import { PersonaIcon } from './PersonaIcon';
import { Check, Sparkles } from 'lucide-react';

interface PersonaSelectorProps {
  activePersona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  compact?: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  activePersona,
  onSelectPersona,
  compact = false,
}) => {
  const personasList = Object.values(PERSONAS);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none">
        {personasList.map((p) => {
          const isActive = p.id === activePersona;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap border ${
                isActive
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              <PersonaIcon persona={p.id} className="w-3.5 h-3.5" />
              <span>{p.name}</span>
              {isActive && <Check className="w-3 h-3 ml-0.5 stroke-[2.5]" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {personasList.map((p) => {
          const isActive = p.id === activePersona;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 group flex flex-col justify-between ${
                isActive
                  ? 'bg-neutral-900 border-white/80 ring-1 ring-white/20 shadow-md'
                  : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-900/60 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                      isActive
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 group-hover:border-neutral-700 group-hover:text-white'
                    }`}
                  >
                    <PersonaIcon persona={p.id} className="w-4 h-4" />
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-mono tracking-tight">
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-white tracking-tight">
                  {p.name}
                </div>
                <p className="text-[11.5px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[10.5px]">
                <span className="text-neutral-500 truncate max-w-[140px]">
                  {p.toneDescription.split(',')[0]}
                </span>
                <span
                  className={`text-[11px] font-mono transition-transform duration-200 ${
                    isActive ? 'text-white' : 'text-neutral-600 group-hover:text-neutral-400'
                  }`}
                >
                  {isActive ? '● Selected' : 'Select →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
