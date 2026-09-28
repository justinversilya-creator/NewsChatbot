import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../services/newsService';

const SUGGESTED_QUESTIONS = [
  "What happened?",
  "Summarize this in 5 points",
  "Why is this important?",
  "Who are the key people?",
  "What is the impact?",
  "Explain this simply"
];

export default function ChatbotView({ 
  article, 
  onBackToFeed 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: `Hello! I am your news-specific assistant for this article: "${article.title}". You can ask me any question, and I'll answer using only the information from this article.`,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const messagesEndRef = useRef(null);
  const msgCounter = useRef(1);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    setError(null);
    msgCounter.current += 1;
    const userMessage = {
      id: `user-${msgCounter.current}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          news: {
            title: article.title,
            summary: article.summary,
            source: article.source?.name || article.source || 'Unknown',
            published: article.publishedAt || 'Unknown',
            category: article.category || 'general',
            url: article.sourceUrl || 'Unknown'
          },
          question: query.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from the server.');
      }

      const data = await response.json();
      
      msgCounter.current += 1;
      const botMessage = {
        id: `bot-${msgCounter.current}`,
        sender: 'assistant',
        text: data.answer,
        source: data.source,
        grounded: data.grounded,
        timestamp: 'Just now'
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedClick = (question) => {
    handleSendMessage(question);
  };

  const handleResetChat = () => {
    msgCounter.current += 1;
    setMessages([
      {
        id: `init-msg-${msgCounter.current}`,
        sender: 'assistant',
        text: `Conversation reset. Ask any question regarding "${article.title}".`,
        timestamp: 'Just now'
      }
    ]);
    setError(null);
  };

  return (
    <div className="chatbot-page-view">
      {/* Top Breadcrumb Navigation */}
      <div className="chatbot-top-bar">
        <div className="container chatbot-top-content">
          <button 
            type="button" 
            className="btn btn-secondary btn-back"
            onClick={onBackToFeed}
          >
            <ArrowLeft size={16} />
            <span>Back to All News</span>
          </button>

          <div className="chatbot-badge-group">
            <span className="live-status-pill">
              <span className="live-dot" />
              <span>Context: 1 Article Selected</span>
            </span>
            <span className="api-ready-pill grounded-pill">
              <ShieldCheck size={13} />
              <span>Grounded to Article context</span>
            </span>
          </div>
        </div>
      </div>

      <div className="container chatbot-main-layout">
        {/* Left Column / Context Column: Pinned Article Details */}
        <aside className="article-context-sidebar">
          <div className="context-card">
            <div className="context-card-header">
              <span className="context-label">FOCUSED ARTICLE</span>
              <button
                type="button"
                className="toggle-summary-btn"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                aria-label="Toggle full context"
              >
                {isSummaryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className="context-meta">
              <span className="context-category">{article.categoryLabel}</span>
              <span className="meta-separator">•</span>
              <span className="context-source">{article.source?.name || article.source}</span>
              <span className="meta-separator">•</span>
              <span className="context-time">
                <Clock size={12} className="inline-icon" />
                {article.publishedAt}
              </span>
            </div>

            <h2 className="context-title">{article.title}</h2>

            {isSummaryExpanded && (
              <div className="context-summary-block">
                <div className="summary-header">
                  <span className="summary-title">ARTICLE SUMMARY</span>
                </div>
                <p className="summary-content">{article.summary}</p>

                <div className="context-external-link">
                  <a 
                    href={article.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    <span>View original report at {article.source?.name || article.source}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )}
            
            <div className="backend-readiness-notice">
              <Info size={15} className="notice-icon" />
              <div className="notice-text">
                <strong>Contextual Assistant</strong>
                <p>The chatbot only has access to the information provided in this summary.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Chatbot Conversation & Suggested Questions */}
        <main className="chatbot-conversation-pane">
          <div className="chat-pane-header">
            <div className="chat-pane-title">
              <div className="bot-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h3>News Intelligence Assistant</h3>
                <p>Specialized contextual assistant for this verified wire</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-icon"
              title="Reset conversation"
              onClick={handleResetChat}
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Messages list */}
          <div className="messages-container" role="log" aria-live="polite">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message-row ${msg.sender === 'user' ? 'message-user' : 'message-assistant'}`}
              >
                <div className="message-avatar">
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    {msg.sender === 'assistant' && msg.id !== 'init-msg' && msg.source && (
                       <div className="message-attribution">
                         <ShieldCheck size={12} className="inline-icon" />
                         <span>Source: {msg.source}</span>
                       </div>
                    )}
                  </div>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-row message-assistant">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble-wrapper">
                  <div className="message-bubble typing-indicator">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="message-row">
                 <div className="message-bubble-wrapper error-bubble-wrapper">
                    <div className="error-bubble">
                      <AlertTriangle size={14} />
                      <span>{error}</span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Section */}
          <div className="suggested-questions-tray">
            <div className="suggested-heading">
              <Sparkles size={14} className="sparkle-icon" />
              <span>Suggested Questions for this story</span>
            </div>
            <div className="suggested-chips-grid">
              {SUGGESTED_QUESTIONS.map((question, i) => (
                <button
                  key={i}
                  type="button"
                  className="suggested-chip-btn"
                  onClick={() => handleSuggestedClick(question)}
                  disabled={isLoading}
                >
                  <Sparkles size={12} className="chip-icon" />
                  <span>{question}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Form */}
          <form 
            className="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <div className="input-group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask any question about this news article..."
                className="chat-text-input"
                aria-label="Ask a question about this article"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="btn btn-primary send-btn"
                disabled={!inputValue.trim() || isLoading}
                title="Send query"
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </div>
            <div className="input-footer-note">
              <span>English only • Grounded to verified article wire • Ready for FastAPI</span>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
