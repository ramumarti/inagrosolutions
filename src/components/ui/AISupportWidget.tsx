"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Minimize2, Bot } from 'lucide-react';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { useI18n } from '@/lib/i18n';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AISupportWidget() {
  const { profile } = useAgriProfile();
  const { language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: '¡Hola! Soy CDC, el asistente virtual para tu Cuaderno Digital de Campo. ¿En qué puedo ayudarte hoy con tu Cuaderno?'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Open widget via custom event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-support', handleOpen);
    return () => window.removeEventListener('open-ai-support', handleOpen);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Si no está logueado, no mostramos el widget (o se podría ocultar según contexto)
  if (!profile) return null;

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          userRole: profile.platform_role
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Lo siento, ha ocurrido un error de conexión." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Lo siento, ha ocurrido un error." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-[var(--color-primary)] text-black shadow-2xl hover:scale-110 transition-transform z-50 animate-in fade-in slide-in-from-bottom-4 group flex items-center gap-2"
      >
        <Bot size={24} />
        <span className="font-bold hidden group-hover:block whitespace-nowrap px-2 overflow-hidden w-0 group-hover:w-auto animate-in slide-in-from-right-2">Asistente CDC</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-[360px] h-[500px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.2)] flex flex-col z-50 animate-in slide-in-from-bottom-4 zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[var(--color-primary)]/10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary)] rounded-full text-black">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">CDC (Asistente IA)</h3>
            <p className="text-[10px] text-white/50">{profile.platform_role === 'tenant_admin' ? 'Soporte a Cooperativas' : 'Soporte al Agricultor'}</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-[var(--color-primary)] text-black rounded-br-none font-medium' 
                  : 'bg-white/10 text-white rounded-bl-none border border-white/5'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 bg-white/10 rounded-2xl rounded-bl-none border border-white/5 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-white/10 bg-white/5 rounded-b-2xl flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda..."
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
