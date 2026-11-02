/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  PersonaType,
  ToneType,
  ResponseLengthType,
  ModelType,
  ChatMessage,
  SessionData,
  PERSONAS,
} from './types/persona';
import { Navbar } from './components/Navbar';
import { PersonaSelector } from './components/PersonaSelector';
import { ControlsBar } from './components/ControlsBar';
import { ChatArea } from './components/ChatArea';
import { MessageInput } from './components/MessageInput';
import { HistoryDrawer } from './components/HistoryDrawer';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY_SESSIONS = 'persona_prompt_bot_sessions_v1';
const LOCAL_STORAGE_KEY_ACTIVE = 'persona_prompt_bot_active_session_v1';

export default function App() {
  // Current session parameters
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return 'session_' + Date.now();
  });
  const [activePersona, setActivePersona] = useState<PersonaType>('TEACHER');
  const [tone, setTone] = useState<ToneType>('professional');
  const [length, setLength] = useState<ResponseLengthType>('detailed');
  const [model, setModel] = useState<ModelType>('gemini-3.8-flash');
  const [searchGrounding, setSearchGrounding] = useState<boolean>(false);
  const [thinkingMode, setThinkingMode] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // App UI states
  const [showPersonaBar, setShowPersonaBar] = useState<boolean>(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Auth and Firestore
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [savedSessions, setSavedSessions] = useState<SessionData[]>([]);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load local sessions on start
  useEffect(() => {
    if (!user) {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SESSIONS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSavedSessions(parsed);
          }
        }
      } catch (e) {
        console.error('Failed reading local sessions:', e);
      }
    }
  }, [user]);

  // Sync with Firestore when authenticated
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/sessions`;
    try {
      const q = collection(db, path);
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: SessionData[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push(docSnap.data() as SessionData);
          });
          // Sort client-side by updatedAt descending
          fetched.sort((a, b) => {
            const timeA = a.updatedAt?.toMillis
              ? a.updatedAt.toMillis()
              : (a.updatedAt as number) || 0;
            const timeB = b.updatedAt?.toMillis
              ? b.updatedAt.toMillis()
              : (b.updatedAt as number) || 0;
            return timeB - timeA;
          });
          setSavedSessions(fetched);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }, [user]);

  // Persist current session either to Firestore or localStorage
  const persistSession = useCallback(
    async (
      updatedMessages: ChatMessage[],
      personaToSave: PersonaType = activePersona,
      toneToSave: ToneType = tone,
      lenToSave: ResponseLengthType = length
    ) => {
      if (updatedMessages.length === 0) return;

      const firstUserMsg =
        updatedMessages.find((m) => m.role === 'user')?.content || 'New Chat';
      const sessionTitle =
        firstUserMsg.length > 50
          ? firstUserMsg.slice(0, 47) + '...'
          : firstUserMsg;

      const sessionObj: SessionData = {
        id: currentSessionId,
        userId: user ? user.uid : 'guest',
        title: sessionTitle,
        persona: personaToSave,
        tone: toneToSave,
        length: lenToSave,
        model,
        searchGrounding,
        thinkingMode,
        messages: updatedMessages,
        createdAt: user ? serverTimestamp() : Date.now(),
        updatedAt: user ? serverTimestamp() : Date.now(),
      };

      if (user) {
        const docPath = `users/${user.uid}/sessions/${currentSessionId}`;
        try {
          await setDoc(doc(db, 'users', user.uid, 'sessions', currentSessionId), sessionObj, {
            merge: true,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        }
      } else {
        // Save to localStorage
        setSavedSessions((prev) => {
          const filtered = prev.filter((s) => s.id !== currentSessionId);
          const next = [sessionObj, ...filtered];
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY_SESSIONS, JSON.stringify(next));
          } catch (e) {
            console.error('LocalStorage write error:', e);
          }
          return next;
        });
      }
    },
    [
      currentSessionId,
      activePersona,
      tone,
      length,
      model,
      searchGrounding,
      thinkingMode,
      user,
    ]
  );

  // Start a fresh conversation
  const handleNewChat = () => {
    const newId = 'session_' + Date.now();
    setCurrentSessionId(newId);
    setMessages([]);
    setError(null);
  };

  // Switch persona
  const handleSelectPersona = (newPersona: PersonaType) => {
    setActivePersona(newPersona);
    // If conversation already has messages, persist current state with new persona
    if (messages.length > 0) {
      persistSession(messages, newPersona);
    }
  };

  // Clear current conversation
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Send message to server Gemini proxy
  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || isLoading) return;

    setError(null);

    // Natural language persona switch detector (e.g. "Switch to Developer", "Act as a Marketer")
    let targetPersona = activePersona;
    const lowerPrompt = userPrompt.toLowerCase();
    if (
      lowerPrompt.includes('as a developer') ||
      lowerPrompt.includes('switch to developer') ||
      lowerPrompt.includes('developer persona')
    ) {
      targetPersona = 'DEVELOPER';
      setActivePersona('DEVELOPER');
    } else if (
      lowerPrompt.includes('as a teacher') ||
      lowerPrompt.includes('switch to teacher') ||
      lowerPrompt.includes('teacher persona')
    ) {
      targetPersona = 'TEACHER';
      setActivePersona('TEACHER');
    } else if (
      lowerPrompt.includes('as a marketer') ||
      lowerPrompt.includes('switch to marketer') ||
      lowerPrompt.includes('marketer persona')
    ) {
      targetPersona = 'MARKETER';
      setActivePersona('MARKETER');
    } else if (
      lowerPrompt.includes('as a recruiter') ||
      lowerPrompt.includes('switch to recruiter') ||
      lowerPrompt.includes('recruiter persona')
    ) {
      targetPersona = 'RECRUITER';
      setActivePersona('RECRUITER');
    } else if (
      lowerPrompt.includes('as a consultant') ||
      lowerPrompt.includes('switch to consultant') ||
      lowerPrompt.includes('consultant persona')
    ) {
      targetPersona = 'CONSULTANT';
      setActivePersona('CONSULTANT');
    }

    const newUserMessage: ChatMessage = {
      id: 'msg_' + Date.now() + '_user',
      role: 'user',
      content: userPrompt,
      persona: targetPersona,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Call server-side API proxy
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona: targetPersona,
          tone,
          length,
          model,
          searchGrounding,
          thinkingMode,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with HTTP status ${response.status}`
        );
      }

      const data = await response.json();

      const newAIMessage: ChatMessage = {
        id: 'msg_' + Date.now() + '_ai',
        role: 'model',
        content: data.text || 'No response was returned by the model.',
        persona: targetPersona,
        timestamp: Date.now(),
        modelUsed: data.modelUsed,
        groundingSources: data.groundingSources,
        searchQueries: data.searchQueries,
      };

      const finalMessages = [...updatedMessages, newAIMessage];
      setMessages(finalMessages);
      persistSession(finalMessages, targetPersona);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(
        err.message || 'Failed to communicate with AI model. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Retry last prompt
  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  // Select a session from history
  const handleSelectSession = (id: string) => {
    const found = savedSessions.find((s) => s.id === id);
    if (found) {
      setCurrentSessionId(found.id);
      setActivePersona(found.persona);
      setTone(found.tone || 'professional');
      setLength(found.length || 'detailed');
      setModel(found.model || 'gemini-3.8-flash');
      setSearchGrounding(Boolean(found.searchGrounding));
      setThinkingMode(Boolean(found.thinkingMode));
      setMessages(found.messages || []);
      setError(null);
    }
  };

  // Delete a session
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      const docPath = `users/${user.uid}/sessions/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      setSavedSessions((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_SESSIONS, JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
        return updated;
      });
    }

    if (id === currentSessionId) {
      handleNewChat();
    }
  };

  // Export current conversation to Markdown
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const personaData = PERSONAS[activePersona];
    let md = `# Persona Prompt Bot: ${personaData.name} Session\n\n`;
    md += `- **Persona:** ${personaData.name} (${personaData.tagline})\n`;
    md += `- **Tone:** ${tone}\n`;
    md += `- **Response Depth:** ${length}\n`;
    md += `- **Date:** ${new Date().toLocaleString()}\n\n---\n\n`;

    messages.forEach((m) => {
      if (m.role === 'user') {
        md += `### User\n${m.content}\n\n`;
      } else {
        const p = PERSONAS[m.persona] || personaData;
        md += `### ${p.name} (AI)\n${m.content}\n\n`;
        if (m.groundingSources && m.groundingSources.length > 0) {
          md += `**Sources:**\n`;
          m.groundingSources.forEach((s) => {
            md += `- [${s.title}](${s.url})\n`;
          });
          md += `\n`;
        }
        md += `---\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `persona-prompt-bot-${activePersona.toLowerCase()}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activePersona={activePersona}
        onSelectPersona={handleSelectPersona}
        user={user}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
        onNewChat={handleNewChat}
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={savedSessions.length}
        onExportChat={handleExportChat}
        hasMessages={messages.length > 0}
        onTogglePersonaBar={() => setShowPersonaBar(!showPersonaBar)}
        showPersonaBar={showPersonaBar}
      />

      {/* Persona Selection Header Strip / Cards */}
      {showPersonaBar && (
        <div className="bg-neutral-950 px-4 pt-3 pb-3 border-b border-neutral-900 transition-all">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Select Persona
              </span>
              <button
                onClick={() => setShowPersonaBar(false)}
                className="text-[11px] text-neutral-500 hover:text-neutral-300 font-mono transition-colors"
              >
                Hide Cards ↑
              </button>
            </div>
            <PersonaSelector
              activePersona={activePersona}
              onSelectPersona={handleSelectPersona}
            />
          </div>
        </div>
      )}

      {/* Controls Bar: Tone, Length, Grounding, Thinking */}
      <ControlsBar
        tone={tone}
        onChangeTone={setTone}
        length={length}
        onChangeLength={setLength}
        searchGrounding={searchGrounding}
        onToggleSearchGrounding={() => {
          setSearchGrounding((prev) => !prev);
          if (!searchGrounding) {
            setThinkingMode(false); // Grounding uses gemini-3.8-flash
          }
        }}
        thinkingMode={thinkingMode}
        onToggleThinkingMode={() => {
          setThinkingMode((prev) => !prev);
          if (!thinkingMode) {
            setSearchGrounding(false); // High thinking uses gemini-4-argon
          }
        }}
        model={model}
        onChangeModel={setModel}
      />

      {/* Main Chat Thread Area */}
      <ChatArea
        messages={messages}
        activePersona={activePersona}
        tone={tone}
        length={length}
        isLoading={isLoading}
        error={error}
        onSelectPrompt={handleSendMessage}
        onRetry={handleRetry}
        onSwitchPersona={handleSelectPersona}
      />

      {/* Message Input & Send Controls */}
      <MessageInput
        activePersona={activePersona}
        tone={tone}
        length={length}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        hasMessages={messages.length > 0}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={savedSessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        user={user}
      />
    </div>
  );
}
