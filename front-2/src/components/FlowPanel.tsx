import React, { useState, useRef, useCallback, useEffect } from 'react';
import './FlowPanel.css';

const FLOW_URL = import.meta.env.VITE_FLOW_URL || 'http://localhost:3000';

interface FlowPanelProps {
  viewId: string;
  onClose: () => void;
}

export const FlowPanel: React.FC<FlowPanelProps> = ({ viewId, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pos, setPos] = useState({ x: window.innerWidth - 660, y: 80 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isFullscreen) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [isFullscreen, pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const iframeUrl = `${FLOW_URL}?view=${encodeURIComponent(viewId)}`;

  return (
    <div
      ref={panelRef}
      className={`flow-panel ${isFullscreen ? 'flow-panel--fullscreen' : ''}`}
      style={isFullscreen ? undefined : { left: pos.x, top: pos.y }}
    >
      <div className="flow-panel__header" onMouseDown={onMouseDown}>
        <span className="flow-panel__title">Flowtia · {viewId}</span>
        <div className="flow-panel__actions">
          <button
            className="flow-panel__btn"
            title={isFullscreen ? 'Restore' : 'Fullscreen'}
            onClick={() => setIsFullscreen((v) => !v)}
          >
            {isFullscreen ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            )}
          </button>
          <button className="flow-panel__btn" title="Close" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <iframe
        className="flow-panel__iframe"
        src={iframeUrl}
        title="Flowtia diagram"
        allow="fullscreen"
      />
    </div>
  );
};
