import React, { useState } from 'react';
import { marked } from 'marked';
import type { ChatMessage as ChatMessageType } from '../types/chat';
import scotiaLogo from '../assets/scotia-logo.svg';
import flowtiaLogo from '../assets/flowtia-logo.svg';
import { LoadingDots } from './LoadingDots';
import './ChatMessage.css';

const FLOW_URL = import.meta.env.VITE_FLOW_URL || 'http://localhost:3000';

interface ChatMessageProps {
  message: ChatMessageType;
  onOpenFlowPanel: (viewId: string) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOpenFlowPanel,
  onRegenerate,
  isRegenerating,
}) => {
  const [copied, setCopied] = useState(false);

  const isFlowtia = !!message.flowtiaViewId;
  const agentName = isFlowtia ? 'Flowtia' : 'Curiosity';
  const agentLogo = isFlowtia ? flowtiaLogo : scotiaLogo;

  const completionLabel = message.completionTimeMs != null
    ? `Completed in ${(message.completionTimeMs / 1000).toFixed(message.completionTimeMs < 10000 ? 1 : 0)}s`
    : null;

  const renderContent = () => {
    const html = marked.parse(message.content, { breaks: true, gfm: true }) as string;
    return { __html: html };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (message.role === 'user') {
    return (
      <div className="chat-message user">
        <div className="user-bubble">
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-message assistant">
      <div className="assistant-header">
        <img src={agentLogo} alt={agentName} className="assistant-avatar-img" />
        <span className="assistant-name">{agentName}</span>
        {isRegenerating ? (
          <div className="assistant-timing-group">
            <span className="assistant-timing-dot"></span>
            <span className="assistant-timing shimmer-text">Thinking...</span>
          </div>
        ) : completionLabel ? (
          <div className="assistant-timing-group">
            <span className="assistant-timing-dot"></span>
            <span className="assistant-timing">{completionLabel}</span>
          </div>
        ) : null}
      </div>

      <div className="assistant-body">
        {isRegenerating ? (
          <div className="loading-dots-container">
            <LoadingDots />
          </div>
        ) : (
          <div className="assistant-bubble">
            <div className="message-content">
              <div dangerouslySetInnerHTML={renderContent()} />
              {message.imageBase64 && (
                <div className="message-image">
                  <img
                    src={`data:image/png;base64,${message.imageBase64}`}
                    alt="Generated chart"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {message.flowtiaViewId && (
          <div className="flowtia-inline">
            <div className="flowtia-inline__toolbar">
              <span className="flowtia-inline__label">Diagram · {message.flowtiaViewId}</span>
              <button
                className="flowtia-inline__btn"
                title="Pop out"
                onClick={() => onOpenFlowPanel(message.flowtiaViewId!)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>
            <iframe
              className="flowtia-inline__iframe"
              src={`${FLOW_URL}?view=${encodeURIComponent(message.flowtiaViewId)}`}
              title="Flowtia diagram"
            />
          </div>
        )}

        <div className="message-actions">
          <button
            className={`action-btn${copied ? ' action-btn--copied' : ''}`}
            type="button"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            className={`action-btn${isRegenerating ? ' action-btn--loading' : ''}`}
            type="button"
            onClick={onRegenerate}
            disabled={!onRegenerate || isRegenerating}
            title="Re-generate response"
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              style={isRegenerating ? { animation: 'spin 1s linear infinite' } : undefined}
            >
              <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isRegenerating ? 'Generating…' : 'Re-generate'}
          </button>
        </div>
      </div>
    </div>
  );
};
