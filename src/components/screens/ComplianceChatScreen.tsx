import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import { Send, Scale, BookOpen, Loader2, Sparkles, Key, CheckCircle2 } from 'lucide-react';
import { askComplianceChatApi } from '../../services/api';
import { getGeminiApiKey } from '../../services/clientGeminiVision';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citation?: string;
  time: string;
}

export const ComplianceChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Namaste Inspector. I am your MANAK Legal Metrology AI Assistant powered by Google Gemini. Ask me anything regarding the Legal Metrology Act 2009, Packaged Commodities Rules 2011, numeral height tables, e-commerce obligations under Rule 6(10), or compounding penalties.',
      citation: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [keySavedMessage, setKeySavedMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeApiKey = getGeminiApiKey();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveCustomKey = () => {
    if (customKey.trim()) {
      localStorage.setItem('MANAK_GEMINI_KEY', customKey.trim());
      setKeySavedMessage(true);
      setTimeout(() => {
        setKeySavedMessage(false);
        setShowKeyModal(false);
      }, 1200);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!queryText) setInput('');

    setIsLoading(true);
    try {
      const res = await askComplianceChatApi(textToSend, newHistory);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer || 'Refer to Legal Metrology (Packaged Commodities) Rules, 2011 for explicit statutory directives.',
        citation: res.citation || 'Legal Metrology (Packaged Commodities) Rules, 2011',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Rule 6(1) specifies mandatory declarations: manufacturer details, generic name, net quantity, MRP (inclusive of all taxes), mfg date, and consumer care details.',
        citation: 'Rule 6(1) Packaged Commodities Rules 2011',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Markdown / Rich Text formatter for ChatGPT/Gemini style answers
  const renderMessageContent = (text: string, isUser: boolean) => {
    if (isUser) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }

    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Parse **bold** parts
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          const renderedParts = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={i} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          // Bullet list items
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1">
                <span className="text-manak-navy font-bold leading-none mt-1">•</span>
                <span className="flex-1">{renderedParts}</span>
              </div>
            );
          }

          // Numbered list items
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s(.*)/);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1">
                <span className="text-manak-orange font-bold font-mono">{match ? match[1] : '•'}</span>
                <span className="flex-1">{match ? match[2] : renderedParts}</span>
              </div>
            );
          }

          // Header lines (### or ##)
          if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            const headingText = trimmed.replace(/^#+\s*/, '');
            return (
              <h4 key={idx} className="font-extrabold text-manak-navy text-xs mt-2 mb-1 border-b border-slate-100 pb-0.5">
                {headingText}
              </h4>
            );
          }

          return (
            <p key={idx} className="text-xs leading-relaxed">
              {renderedParts}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#F5F6F8] flex flex-col justify-between overflow-hidden">
      <Header title="Legal Metrology AI Assistant" showBack showLogo />

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
        {/* Banner with Gemini status */}
        <div className="bg-gradient-to-r from-blue-900/10 via-slate-100 to-amber-500/10 rounded-2xl p-3 border border-blue-200/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-manak-navy text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-manak-orange animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900">Gemini Legal Intelligence</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              </div>
              <p className="text-[10px] text-slate-600">
                Live statutory consultation on 2011 Rules &amp; Act 2009
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            title="Configure Gemini API Key"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-manak-navy hover:border-manak-navy transition-colors shadow-xs"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-subtle ${
                msg.sender === 'user'
                  ? 'bg-manak-navy text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
              }`}
            >
              {renderMessageContent(msg.text, msg.sender === 'user')}

              {msg.citation && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10.5px] text-manak-navy font-semibold flex items-center gap-1.5 bg-slate-50/70 -mx-1 -mb-1 px-2.5 py-1.5 rounded-lg">
                  <Scale className="w-3.5 h-3.5 text-manak-orange flex-shrink-0" />
                  <span className="font-mono">{msg.citation}</span>
                </div>
              )}
            </div>
            <span className="text-[9.5px] text-slate-400 mt-1 px-1 mono">{msg.time}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2.5 text-xs text-slate-600 bg-white/80 backdrop-blur-xs border border-blue-100 rounded-2xl p-3 max-w-[80%] shadow-subtle">
            <Loader2 className="w-4 h-4 animate-spin text-manak-navy flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-800">Gemini AI is analyzing Legal Metrology rules...</span>
              <span className="text-[10px] text-slate-500">Cross-referencing statutory sections &amp; citations</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* Suggested Queries */}
        <div className="pt-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase mono block mb-1.5">
            Suggested Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'E-Commerce Rule 6(10)', q: 'What declarations are mandatory on e-commerce listings under Rule 6(10)?' },
              { label: 'MRP & Tax Disclaimer', q: 'What is the mandatory MRP tax disclaimer format under Rule 6(1)(e)?' },
              { label: 'Rule 32 Penalties', q: 'What are the compounding penalty amounts under Rule 32 for missing declarations?' },
              { label: 'Importer Declarations', q: 'What are mandatory declarations for imported packaged goods under 2011 Rules?' },
              { label: 'Numeral Height Table', q: 'What are the minimum numeral and letter heights under Rule 7 Table I & II?' }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => handleSend(item.q)}
                className="text-[10px] py-1 px-2.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 transition-colors shadow-subtle active:scale-95"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Input Bar */}
      <footer className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 z-20 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything on Legal Metrology 2011 Rules..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-manak-navy"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-manak-navy hover:bg-slate-900 text-white transition-colors disabled:opacity-50 active:scale-95"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-manak-orange" />}
        </button>
      </footer>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-manak-navy/10 text-manak-navy flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Gemini AI Configuration</h3>
                <p className="text-[10.5px] text-slate-500">Provide or update your Gemini API key</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Google Gemini API Key
              </label>
              <input
                type="password"
                defaultValue={activeApiKey}
                onChange={e => setCustomKey(e.target.value)}
                placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs mono focus:outline-none focus:border-manak-navy"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Active Key: {activeApiKey ? `${activeApiKey.slice(0, 6)}...${activeApiKey.slice(-4)}` : 'None'}
              </p>
            </div>

            {keySavedMessage && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>API key updated successfully!</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleSaveCustomKey}
                className="px-3.5 py-1.5 bg-manak-navy hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};
