import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage as ChatMessageType, Conversation } from '../types/chat';
import { chatApi, ApiError, parseStreamMeta, parseLlmTags } from '../services/api';
import { ChatMessage } from './ChatMessage';
import { Sidebar } from './Sidebar';
import { LoadingDots } from './LoadingDots';
import scotiaLogo from '../assets/scotia-logo.svg';
import expandIcon from '../assets/expand-icon.svg';
import moreOptionsIcon from '../assets/more-options-icon.svg';
import './ChatInterface.css';

interface ChatInterfaceProps {
  onLogout: () => void;
  onOpenFlowPanel: (viewId: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

const SAMPLE_PROMPTS = [
  'What account types does Scotia iTrade offer?',
  'What are the commission fees for stock trading?',
  'How do I open a Scotia iTrade account?',
  'What research tools are available on the platform?',
  'How does the TFSA contribution limit work?',
];

const STORAGE_KEY = 'curiosity_conversations';

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

function generateTitle(content: string): string {
  return content.trim().slice(0, 32) + (content.trim().length > 32 ? '…' : '');
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLogout, onOpenFlowPanel, isDark, onToggleDark }) => {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(() => {
    const stored = loadConversations();
    return stored.length > 0 ? stored[0].id : null;
  });
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    const stored = loadConversations();
    if (stored.length > 0) {
      const msgs = stored[0].messages;
      return msgs.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamStartRef = useRef<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (error) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setError(null), 15000);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [error]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    chatApi.healthCheck().catch((err) => {
      console.error('API health check failed:', err);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptionsMenu]);

  const persistMessages = useCallback(
    (msgs: ChatMessageType[], convId: string | null, allConvs: Conversation[]) => {
      if (!convId) return;
      const updated = allConvs.map((c) =>
        c.id === convId
          ? { ...c, messages: msgs, updatedAt: new Date().toISOString() }
          : c
      );
      setConversations(updated);
      saveConversations(updated);
    },
    []
  );

  const handleNewChat = useCallback(() => {
    if (messages.length > 0 && activeId) {
      persistMessages(messages, activeId, conversations);
    }
    setMessages([]);
    setInput('');
    setError(null);
    setActiveId(null);
  }, [messages, activeId, conversations, persistMessages]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (id === activeId) return;
      if (messages.length > 0 && activeId) {
        persistMessages(messages, activeId, conversations);
      }
      const conv = conversations.find((c) => c.id === id);
      if (conv) {
        setMessages(conv.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        setActiveId(id);
        setError(null);
      }
    },
    [activeId, conversations, messages, persistMessages]
  );

  const titledConvsRef = useRef<Set<string>>(new Set());

  const submitMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    let currentId = activeId;
    let currentConvs = conversations;
    const isFirstMessage = messages.length === 0;

    if (!currentId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: generateTitle(text),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      currentId = newConv.id;
      currentConvs = [newConv, ...conversations];
      setConversations(currentConvs);
      saveConversations(currentConvs);
      setActiveId(currentId);
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const historyForApi = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    let accumulated = '';
    streamStartRef.current = Date.now();
    const assistantId = (Date.now() + 1).toString();

    try {
      let isFlowtiaStream = false;
      const stream = chatApi.streamMessage(text, historyForApi);
      for await (const chunk of stream) {
        accumulated += chunk;
        const { clean: withoutMeta } = parseStreamMeta(accumulated);
        const { flowtiaViewId, clean } = parseLlmTags(withoutMeta);

        if (flowtiaViewId && !isFlowtiaStream) {
          isFlowtiaStream = true;
        }
        
        const displayContent = isFlowtiaStream ? 'Generating diagram…' : clean;

        setMessages((prev) => {
          const existing = prev.find((m) => m.id === assistantId);
          if (existing) {
            return prev.map((m) => (m.id === assistantId ? { ...m, content: displayContent } : m));
          } else {
            return [...prev, { id: assistantId, role: 'assistant', content: displayContent, timestamp: new Date() }];
          }
        });
      }

      const { clean: withoutMeta, meta } = parseStreamMeta(accumulated);
      const { titleTag, flowtiaViewId, clean } = parseLlmTags(withoutMeta);

      const completionTimeMs = Date.now() - streamStartRef.current;

      const assistantMessage: ChatMessageType = {
        id: assistantId,
        role: 'assistant',
        content: clean,
        titleTag: titleTag ?? undefined,
        flowtiaViewId: flowtiaViewId ?? undefined,
        imageBase64: meta.image_base64,
        agentUsed: meta.agent_used,
        completionTimeMs,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      persistMessages(finalMessages, currentId, currentConvs);

      if (isFirstMessage && currentId && !titledConvsRef.current.has(currentId)) {
        titledConvsRef.current.add(currentId);
        chatApi.generateTitle(text).then((llmTitle) => {
          const updatedConvs = currentConvs.map((c) =>
            c.id === currentId ? { ...c, title: llmTitle } : c
          );
          setConversations(updatedConvs);
          saveConversations(updatedConvs);
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'An unexpected error occurred. Please try again.';

      if (err instanceof ApiError && err.statusCode === 401) {
        setTimeout(() => onLogout(), 2000);
      }

      setError(errorMessage);
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === assistantId);
        if (existing) {
          return prev.map((m) =>
            m.id === assistantId ? { ...m, content: `Error: ${errorMessage}` } : m
          );
        } else {
          return [...prev, { id: assistantId, role: 'assistant', content: `Error: ${errorMessage}`, timestamp: new Date() }];
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (assistantMsgId: string) => {
    if (isLoading || regeneratingId) return;

    const msgIndex = messages.findIndex((m) => m.id === assistantMsgId);
    if (msgIndex < 1) return;

    const precedingUserMsg = [...messages].slice(0, msgIndex).reverse().find((m) => m.role === 'user');
    if (!precedingUserMsg) return;

    const historyForApi = messages
      .slice(0, msgIndex - 1)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    setRegeneratingId(assistantMsgId);
    setError(null);

    setMessages((prev) =>
      prev.map((m) => (m.id === assistantMsgId ? { ...m, content: '', titleTag: undefined, flowtiaViewId: undefined, imageBase64: undefined, agentUsed: undefined, completionTimeMs: undefined } : m))
    );

    let accumulated = '';
    streamStartRef.current = Date.now();

    try {
      let isFlowtiaStream = false;
      const stream = chatApi.streamMessage(precedingUserMsg.content, historyForApi);
      for await (const chunk of stream) {
        accumulated += chunk;
        const { clean: withoutMeta } = parseStreamMeta(accumulated);
        const { flowtiaViewId, clean } = parseLlmTags(withoutMeta);

        if (flowtiaViewId && !isFlowtiaStream) {
          isFlowtiaStream = true;
        }

        const displayContent = isFlowtiaStream ? 'Generating diagram…' : clean;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: displayContent } : m))
        );
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      const { clean: withoutMeta, meta } = parseStreamMeta(accumulated);
      const { titleTag, flowtiaViewId, clean } = parseLlmTags(withoutMeta);

      const regenCompletionMs = Date.now() - streamStartRef.current;

      const regenerated: ChatMessageType = {
        id: assistantMsgId,
        role: 'assistant',
        content: clean,
        titleTag: titleTag ?? undefined,
        flowtiaViewId: flowtiaViewId ?? undefined,
        imageBase64: meta.image_base64,
        agentUsed: meta.agent_used,
        completionTimeMs: regenCompletionMs,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === assistantMsgId ? regenerated : m));
        if (activeId) {
          persistMessages(updated, activeId, conversations);
        }
        return updated;
      });
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Regeneration failed.';
      if (err instanceof ApiError && err.statusCode === 401) setTimeout(onLogout, 2000);
      setError(errorMessage);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, content: `Error: ${errorMessage}` } : m))
      );
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    submitMessage(input);
  };

  const handlePromptChip = (prompt: string) => {
    submitMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const handleRenameChat = () => {
    if (!activeId) return;
    const currentTitle = conversations.find((c) => c.id === activeId)?.title ?? 'New Chat';
    setRenameValue(currentTitle);
    setIsRenamingChat(true);
    setShowOptionsMenu(false);
  };

  const saveRename = () => {
    if (!activeId || !renameValue.trim()) {
      setIsRenamingChat(false);
      return;
    }
    const updated = conversations.map((c) =>
      c.id === activeId ? { ...c, title: renameValue.trim() } : c
    );
    setConversations(updated);
    saveConversations(updated);
    setIsRenamingChat(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveRename();
    } else if (e.key === 'Escape') {
      setIsRenamingChat(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeId);
  const chatTitle = activeConv?.title ?? 'New Chat';

  return (
    <div className="chat-layout">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onLogout={onLogout}
      />

      <div className="chat-main">
        <div className="chat-topbar">
          <div className="chat-topbar-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="topbar-chat-icon">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isRenamingChat ? (
              <input
                type="text"
                className="chat-topbar-rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={saveRename}
                onKeyDown={handleRenameKeyDown}
                autoFocus
              />
            ) : (
              <span className="chat-topbar-title">{chatTitle}</span>
            )}
          </div>
          <div className="chat-topbar-actions">
            <button
              className={`theme-pill-toggle${isDark ? ' is-dark' : ''}`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
              onClick={onToggleDark}
            >
              <span className={`theme-pill-icon${!isDark ? ' active-icon' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </span>
              <span className="theme-pill-thumb" />
              <span className={`theme-pill-icon${isDark ? ' active-icon' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              </span>
            </button>
            <button className="topbar-icon-btn" aria-label="Export" title="Export">
              <img src={expandIcon} alt="Export" width="40" height="40" />
            </button>
            <div className="topbar-menu-container" ref={menuRef}>
              <button 
                className="topbar-icon-btn" 
                aria-label="More options" 
                title="More options"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <img src={moreOptionsIcon} alt="More options" width="40" height="40" />
              </button>
              {showOptionsMenu && (
                <div className="topbar-dropdown-menu">
                  <button className="dropdown-menu-item" onClick={handleRenameChat}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Rename
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <h1 className="welcome-heading">
                Welcome to{' '}
                <span className="curiosity-gradient">Curiosity,</span>{' '}
                your guide<br />for all things Scotiabank.
              </h1>
              <div className="prompt-chips">
                {SAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    className="prompt-chip"
                    onClick={() => handlePromptChip(prompt)}
                    disabled={isLoading}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="chip-icon">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onOpenFlowPanel={onOpenFlowPanel}
              onRegenerate={message.role === 'assistant' ? () => handleRegenerate(message.id) : undefined}
              isRegenerating={regeneratingId === message.id}
            />
          ))}

          {isLoading && (
            <div className="loading-row">
              <div className="assistant-header">
                <img src={scotiaLogo} alt="Curiosity" className="assistant-avatar-img" />
                <span className="assistant-name">Curiosity</span>
                <div className="assistant-timing-group">
                  <span className="assistant-timing-dot"></span>
                  <span className="assistant-timing shimmer-text">Thinking...</span>
                </div>
              </div>
              <div className="assistant-body">
                <div className="loading-dots-container">
                  <LoadingDots />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="error-card">
            <div className="error-card-body">
              <svg className="error-card-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="3.2" fill="#EC111A" transform="rotate(45 12 12)" />
                <path d="M12 8.5v4.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="15.8" r="1.1" fill="white" />
              </svg>
              <span className="error-card-text">{error}</span>
              <button className="error-card-close" onClick={() => setError(null)} aria-label="Dismiss error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="error-card-progress" />
          </div>
        )}

        <div className="input-area">
          <form className="input-form" onSubmit={handleSubmit}>
            <div className="input-box">
              <button type="button" className="attachment-btn" aria-label="Attach" title="Attach">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="chat-textarea"
                rows={1}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="send-btn"
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
          <p className="input-disclaimer">AI can make mistakes. Always confirm important information.</p>
        </div>
      </div>
    </div>
  );
};
