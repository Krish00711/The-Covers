import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AIAnalyst() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const suggestedPrompts = [
    "Who is the greatest Test batsman ever?",
    "Compare Kohli and Root in Test cricket",
    "India's record at Lord's Cricket Ground",
    "Best bowling spells in Test history",
    "Why does Australia dominate at home?",
    "Greatest Test match ever played",
    "How has Test cricket evolved since 1877?",
    "Build the greatest Test XI of all time"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseOracleResponse = (text) => {
    const parts = [];
    let currentIndex = 0;
    
    const regex = /\[(STAT|PLAYER|VENUE|TEAM)\](.*?)\[\/\1\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the tag
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: text.substring(currentIndex, match.index)
        });
      }

      // Add the tagged content
      parts.push({
        type: match[1].toLowerCase(),
        content: match[2]
      });

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(currentIndex)
      });
    }

    return parts.map((part, i) => {
      switch (part.type) {
        case 'stat':
          return (
            <span key={i} className="font-mono text-accent font-semibold text-xl">
              {part.content}
            </span>
          );
        case 'player':
          return (
            <span
              key={i}
              className="text-primary font-semibold underline decoration-accent/40 cursor-pointer hover:text-accent transition-colors text-xl"
              onClick={() => navigate(`/players?search=${part.content}`)}
            >
              {part.content}
            </span>
          );
        case 'venue':
          return (
            <span key={i} className="text-accent italic text-xl">
              {part.content}
            </span>
          );
        case 'team':
          return (
            <span key={i} className="text-primary font-semibold text-xl">
              {part.content}
            </span>
          );
        default:
          return <span key={i}>{part.content}</span>;
      }
    });
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://the-covers-backend.onrender.com/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.data.message
        }]);
      } else {
        setError(data.error || 'The Oracle is unavailable');
        console.error('API error:', data);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(`Connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePromptClick = (prompt) => {
    sendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden" style={{ paddingLeft: '56px' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Gradient Mesh Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.03) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.02) 0%, transparent 50%)
          `
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 px-12 py-6 border-b border-white/[0.04] bg-background/80 backdrop-blur-xl flex items-center justify-between">
        <div>
          <div className="font-mono text-base text-accent tracking-[0.4em]">THE ORACLE</div>
          <div className="text-base text-primary/60 mt-1">AI Cricket Analyst</div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-sm text-primary/60">GPT-4 CONNECTED</span>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-base text-primary/60 hover:text-accent transition-colors"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-12 py-8">
        <div className="max-w-[900px] mx-auto w-full">
          {messages.length === 0 ? (
            /* Welcome State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              {/* Background Text */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[120px] text-primary/[0.03] pointer-events-none">
                ASK
              </div>

              {/* Cricket Ball Icon */}
              <motion.svg
                width="80"
                height="80"
                viewBox="0 0 60 60"
                className="mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="30" cy="30" r="26" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
                <path d="M 10 30 Q 30 22, 50 30" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
                <path d="M 10 30 Q 30 38, 50 30" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
              </motion.svg>

              <div className="font-mono text-xl text-accent tracking-[0.4em] mb-5">THE ORACLE</div>
              <div className="font-serif text-2xl text-primary/80 text-center mb-4">
                Your personal Test cricket analyst.
              </div>
              <div className="font-serif text-lg text-primary/60 text-center mb-12">
                Ask about players, matches, tactics, history.
              </div>

              <div className="w-32 h-px bg-accent/30 mb-12" />

              {/* Suggested Prompts */}
              <div className="flex flex-wrap justify-center gap-3 max-w-[800px]">
                {suggestedPrompts.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handlePromptClick(prompt)}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-full px-6 py-3 font-serif text-base text-primary hover:bg-accent/[0.08] hover:border-accent/30 hover:text-accent transition-all"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Messages */
            <div className="space-y-8">
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === 'user' ? (
                    /* User Message */
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-end mb-8"
                    >
                      <div className="font-mono text-sm text-primary/60 tracking-[0.2em] mb-3">YOU</div>
                      <div className="text-accent font-serif text-xl text-right max-w-[70%] leading-relaxed">
                        {msg.content}
                      </div>
                    </motion.div>
                  ) : (
                    /* AI Message */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-start mb-10"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="font-mono text-sm text-accent tracking-[0.2em]">THE ORACLE</div>
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <circle cx="5" cy="5" r="4" fill="none" stroke="#C9A84C" strokeWidth="0.8" />
                        </svg>
                      </div>
                      <div className="text-primary font-serif text-xl leading-loose max-w-[85%] pl-5 border-l-2 border-accent/30">
                        {parseOracleResponse(msg.content)}
                      </div>
                    </motion.div>
                  )}
                  
                  {i < messages.length - 1 && (
                    <div className="w-full h-px bg-white/[0.04] my-8" />
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="font-mono text-xs text-accent tracking-[0.2em]">THE ORACLE</div>
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <circle cx="5" cy="5" r="4" fill="none" stroke="#C9A84C" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 pl-5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-accent"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.15
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input Bar */}
      <div 
        className="relative z-10 px-12 py-5 pb-7"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,15,1) 60%, rgba(10,10,15,0) 100%)'
        }}
      >
        <div className="max-w-[900px] mx-auto w-full">
          {/* Contextual Prompts (when chat has messages) */}
          {messages.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(prompt)}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-full px-5 py-2.5 font-serif text-base text-primary hover:bg-accent/[0.08] hover:border-accent/30 hover:text-accent transition-all whitespace-nowrap flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Row */}
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <div className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-6 py-4 flex items-center gap-3 focus-within:border-accent/30 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask The Oracle anything about cricket..."
                maxLength={500}
                className="flex-1 bg-transparent border-none text-primary font-serif text-xl outline-none placeholder:text-primary/30"
              />
              {input.length > 100 && (
                <div className="font-mono text-sm text-primary/60">
                  {input.length}/500
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center hover:bg-[#FFD700] hover:scale-105 active:scale-95 disabled:bg-accent/20 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 size={24} className="text-background animate-spin" />
              ) : (
                <ArrowUp size={24} className="text-background" />
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 text-center text-red-400 text-base">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIAnalyst;
