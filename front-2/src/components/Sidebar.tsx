import React, { useState } from 'react';
import type { Conversation } from '../types/chat';
import scotiaLogo from '../assets/scotia-logo.svg';
import './Sidebar.css';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfLastWeek = new Date(startOfToday);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const recent = filtered.filter((c) => new Date(c.updatedAt) >= startOfToday);
  const lastWeek = filtered.filter(
    (c) => new Date(c.updatedAt) >= startOfLastWeek && new Date(c.updatedAt) < startOfToday
  );
  const older = filtered.filter((c) => new Date(c.updatedAt) < startOfLastWeek);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={scotiaLogo} alt="Scotiabank" className="scotia-logo-img" />
          <span className="sidebar-title">My chats</span>
        </div>
        <div className="sidebar-header-icons">
          <button className="icon-btn shield-btn" title="Security" aria-label="Security">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill="#2E7D32" />
              <path d="M10 14.5l-2.5-2.5-1 1L10 16.5l5.5-5.5-1-1L10 14.5z" fill="white" />
            </svg>
          </button>
        </div>
      </div>

      <div className="sidebar-search-row">
        <div className="sidebar-search">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search Chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="new-chat-btn" onClick={onNewChat} title="New Chat" aria-label="New Chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {filtered.length === 0 && searchQuery && (
          <p className="sidebar-empty">No chats found</p>
        )}

        {recent.length > 0 && (
          <ConversationGroup
            label="Recent"
            items={recent}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
          />
        )}

        {lastWeek.length > 0 && (
          <ConversationGroup
            label="Last week"
            items={lastWeek}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
          />
        )}

        {older.length > 0 && (
          <ConversationGroup
            label="Older"
            items={older}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
          />
        )}

        {conversations.length === 0 && !searchQuery && (
          <p className="sidebar-empty">No chats yet. Start a new chat!</p>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

interface GroupProps {
  label: string;
  items: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const ConversationGroup: React.FC<GroupProps> = ({ label, items, activeId, onSelect }) => (
  <div className="conv-group">
    <p className="conv-group-label">{label}</p>
    {items.map((c) => (
      <ConversationItem key={c.id} conv={c} isActive={c.id === activeId} onSelect={onSelect} />
    ))}
  </div>
);

interface ItemProps {
  conv: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
}

const ConversationItem: React.FC<ItemProps> = ({ conv, isActive, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`conv-item ${isActive ? 'conv-item--active' : ''}`}
      onClick={() => onSelect(conv.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="conv-item-title">{conv.title}</span>
      {hovered && (
        <button
          className="conv-item-menu"
          onClick={(e) => e.stopPropagation()}
          aria-label="More options"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      )}
    </div>
  );
};
