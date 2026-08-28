import { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Sparkles, Plus, 
  History, Trash2, MessageSquare, ChevronLeft, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResponseViewer from './ResponseViewer';
import type { Session } from '@/lib/supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  answer_source?: 'document' | 'external' | 'none';
  sources?: Array<{ filename: string; chunk_index: number; chunk_text?: string }>;
}

interface ChatSessionItem {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

interface ChatInterfaceProps {
  session?: Session | null;
}

const DEFAULT_WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hello! I am RagFlow AI. Upload your documents on the left, and then ask me any questions about them.'
};

export default function ChatInterface({ session }: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or load chat sessions from localStorage (clean up duplicate empty chats)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ragflow_chat_sessions');
      if (saved) {
        const parsed: ChatSessionItem[] = JSON.parse(saved);
        if (parsed.length > 0) {
          // Keep all sessions with user messages, plus at most ONE empty session
          const populated = parsed.filter(s => s.messages.some(m => m.role === 'user'));
          const emptyOne = parsed.find(s => !s.messages.some(m => m.role === 'user'));

          const cleaned = emptyOne ? [emptyOne, ...populated] : (populated.length > 0 ? populated : []);
          if (cleaned.length > 0) {
            setSessions(cleaned);
            setActiveSessionId(cleaned[0].id);
            localStorage.setItem('ragflow_chat_sessions', JSON.stringify(cleaned));
            return;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }

    // Default first session if none exists
    const initialId = Date.now().toString();
    const initialSession: ChatSessionItem = {
      id: initialId,
      title: 'New Chat',
      createdAt: Date.now(),
      messages: [DEFAULT_WELCOME_MSG]
    };
    setSessions([initialSession]);
    setActiveSessionId(initialId);
    try {
      localStorage.setItem('ragflow_chat_sessions', JSON.stringify([initialSession]));
    } catch (_) {}
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem('ragflow_chat_sessions', JSON.stringify(sessions));
      } catch (e) {
        console.error('Failed to save chat sessions:', e);
      }
    }
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [DEFAULT_WELCOME_MSG];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Create a new chat session (or reuse current empty chat)
  const handleNewChat = () => {
    // 1. Check if the current active session is already empty (no user questions asked yet)
    if (activeSession) {
      const hasUserMessage = activeSession.messages.some(m => m.role === 'user');
      if (!hasUserMessage) {
        // Already on an empty chat — don't spawn duplicate, just close sidebar silently
        setShowHistorySidebar(false);
        return;
      }
    }

    // 2. Check if there's any other empty session we can switch to
    const existingEmpty = sessions.find(s => !s.messages.some(m => m.role === 'user'));
    if (existingEmpty) {
      setActiveSessionId(existingEmpty.id);
      setShowHistorySidebar(false);
      return;
    }

    // 3. Otherwise, create a new chat session
    const newId = Date.now().toString();
    const newSession: ChatSessionItem = {
      id: newId,
      title: 'New Chat',
      createdAt: Date.now(),
      messages: [DEFAULT_WELCOME_MSG]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowHistorySidebar(false);
  };

  // Delete a chat session
  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    if (updated.length === 0) {
      const freshId = Date.now().toString();
      const freshSession: ChatSessionItem = {
        id: freshId,
        title: 'New Chat',
        createdAt: Date.now(),
        messages: [DEFAULT_WELCOME_MSG]
      };
      setSessions([freshSession]);
      setActiveSessionId(freshId);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeSessionId) return;

    const userQuestion = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userQuestion };
    
    // Update active session messages & title
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const isFirstUserMsg = !s.messages.some(m => m.role === 'user');
        const newTitle = isFirstUserMsg ? (userQuestion.length > 30 ? userQuestion.slice(0, 30) + '...' : userQuestion) : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    }));

    setInput('');
    setIsLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question: userQuestion }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Query failed');
      }
      const data = await res.json();
      
      const enrichedSources = (data.sources || []).map(
        (src: { filename: string; chunk_index: number }, i: number) => ({
          ...src,
          chunk_text: data.retrieved_chunks?.[i] ?? undefined,
        })
      );

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        answer_source: data.answer_source ?? 'document',
        sources: enrichedSources,
      };
      
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, assistantMsg] };
        }
        return s;
      }));
    } catch (e: any) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: e.message === 'No documents uploaded yet'
          ? 'Please upload a document first using the panel on the left.'
          : 'Sorry, I encountered an error while processing your question. Please ensure the backend is running and documents are uploaded.'
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, errorMsg] };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl shadow-sm flex flex-col h-full min-h-0 relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20 rounded-t-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistorySidebar(!showHistorySidebar)}
            className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title="Chat History"
          >
            <History className="h-5 w-5 text-primary" />
          </button>

          <div>
            <h2 className="font-semibold text-foreground leading-none mb-1 text-sm truncate max-w-[200px] sm:max-w-[300px]">
              {activeSession?.title || 'RagFlow Chat'}
            </h2>
            <p className="text-xs text-muted-foreground">Powered by Llama 3.3 70B via Groq</p>
          </div>
        </div>

        {/* New Chat Button */}
        <Button 
          onClick={handleNewChat} 
          size="sm" 
          variant="outline"
          className="gap-1.5 border-border/60 hover:bg-primary/10 hover:text-primary transition-colors text-xs rounded-lg"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Main Container: Chat + History Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* History Overlay Drawer (ChatGPT style compact sidebar + backdrop) */}
        {showHistorySidebar && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-xs z-15 transition-opacity"
              onClick={() => setShowHistorySidebar(false)}
            />

            {/* Compact Sidebar Panel */}
            <div className="absolute top-0 bottom-0 left-0 w-72 sm:w-80 bg-card/98 backdrop-blur-xl z-20 flex flex-col border-r border-border/60 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="p-3.5 border-b border-border/50 flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-2 text-foreground">
                  <History className="h-4 w-4 text-primary" /> Chat History
                </span>
                <button 
                  onClick={() => setShowHistorySidebar(false)}
                  className="p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <Button 
                  onClick={handleNewChat} 
                  className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 mb-3 text-xs h-9 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> Start New Chat
                </Button>

                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setShowHistorySidebar(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer group transition-all ${
                      s.id === activeSessionId
                        ? 'bg-primary/15 text-primary font-medium border border-primary/20'
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{s.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      title="Delete Chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'min-w-[80%] ml-auto' : 'mr-8'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div className={`p-4 rounded-xl max-w-[85%] ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto rounded-tr-sm' 
                  : 'bg-muted/40 border border-border/50 rounded-tl-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-[15px]">{msg.content}</p>
                ) : (
                  <ResponseViewer answer={msg.content} sources={msg.sources} answerSource={msg.answer_source} />
                )}
              </div>
              
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 mr-8">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted/40 border border-border/50 rounded-xl rounded-tl-sm p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground font-medium animate-pulse">Generating answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border/50 rounded-b-xl focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-[15px] placeholder:text-muted-foreground focus:outline-none"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-10 w-10 shrink-0 rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
