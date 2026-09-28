import React from 'react';
import { Radio, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <Radio size={18} className="footer-icon" />
            <span className="footer-title">NewsPulse</span>
          </div>
          <p className="footer-desc">
            English-only live news briefing engine with 15-minute auto-refresh, concise 30–60 word executive summaries, and context-grounded AI interaction.
          </p>
        </div>

        <div className="footer-meta-col">
          <h4 className="footer-heading">Platform Architecture</h4>
          <ul className="footer-list">
            <li><span className="dot" /> UI Layer: React + Vite + CSS</li>
            <li><span className="dot" /> Service Layer: FastAPI REST (Upcoming Stage)</li>
            <li><span className="dot" /> Intelligence: Contextual RAG & Embeddings (Upcoming Stage)</li>
            <li><span className="dot" /> Refresh: 15-Minute Automatic Cycle</li>
          </ul>
        </div>

        <div className="footer-sources-col">
          <h4 className="footer-heading">Wire Sources Monitored</h4>
          <p className="footer-sources-text">
            Reuters, BBC World News, Associated Press, Bloomberg, TechCrunch, Nature, Sky Sports, Variety.
          </p>
          <div className="footer-badge">
            <Shield size={13} />
            <span>Editorial Attribution Preserved</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} NewsPulse Platform. Frontend Prototype Foundation.</p>
          <p className="footer-notice">All news summaries adhere to 30–60 word editorial constraints.</p>
        </div>
      </div>
    </footer>
  );
}
