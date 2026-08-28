import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FileText, MessageSquare, Cpu, HardDrive, 
  Activity, ArrowUpRight, Plus, RefreshCw, Zap, 
  Search, Trash2, CheckCircle2, AlertCircle, Database, Server,
  BarChart3, Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface DocumentInfo {
  id: string;
  filename: string;
  chunks_count: number;
  upload_time: string;
}

export default function Dashboard() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [systemHealth, setSystemHealth] = useState<{ status: string; db: string; version: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Fetch Documents and Health
  const fetchData = async () => {
    setIsFetching(true);
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Fetch health
      const healthRes = await fetch(`${API_BASE}/health`).catch(() => null);
      if (healthRes && healthRes.ok) {
        const healthData = await healthRes.json();
        setSystemHealth(healthData);
      }

      // Fetch docs
      const docsRes = await fetch(`${API_BASE}/documents`, { headers }).catch(() => null);
      if (docsRes && docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.documents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDelete = async (docId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`${API_BASE}/documents/${docId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalChunks = documents.reduce((acc, curr) => acc + (curr.chunks_count || 0), 0);
  const filteredDocs = documents.filter(d => d.filename.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20">
      <Head>
        <title>Dashboard | RagFlow Intelligence</title>
        <meta name="description" content="Manage your RagFlow knowledge base, monitor query performance, and inspect system health." />
      </Head>

      {/* Background Gradients */}
      <div className="fixed inset-0 min-h-screen z-[-1] overflow-hidden bg-background pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-blue-500/10 blur-[130px]" />
      </div>

      <Navbar />

      <main className="pt-28 md:pt-36 pb-20 px-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-primary/15 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> System Overview
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Overview of your vector store, active models, knowledge base status, and system health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={fetchData} 
              disabled={isFetching}
              className="gap-2 border-border/60 bg-muted/30 hover:bg-muted/60"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </Button>
            
            <Button 
              onClick={() => router.push('/app')}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <Plus className="w-4 h-4" />
              Open Chat Workspace
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Card 1: Knowledge Documents */}
          <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documents</span>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1">{documents.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-emerald-400 font-medium">Active</span> in vector index
            </p>
          </div>

          {/* Card 2: Total Vector Chunks */}
          <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vector Chunks</span>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1">{totalChunks}</div>
            <p className="text-xs text-muted-foreground">384-dim BAAI embeddings</p>
          </div>

          {/* Card 3: LLM Model */}
          <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active LLM Engine</span>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold tracking-tight mb-1 truncate">Llama 3.3 70B</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Groq LPUs (&lt;0.5s)
            </p>
          </div>

          {/* Card 4: System Status */}
          <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Health</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Operational</span>
            </div>
            <p className="text-xs text-muted-foreground">v{systemHealth?.version || '2.0.0'} • {systemHealth?.db || 'Supabase'}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Document Manager */}
          <div className="lg:col-span-2 bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Knowledge Base Registry</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage indexed documents and inspect chunk density.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter documents..."
                  className="w-full bg-muted/40 border border-border/50 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl bg-muted/10">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <h3 className="text-sm font-medium mb-1">No documents found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  {searchQuery ? "No files match your search query." : "Upload documents in the workspace to see them here."}
                </p>
                <Button size="sm" onClick={() => router.push('/app')} className="gap-2">
                  <Plus className="w-3.5 h-3.5" /> Upload Document
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground uppercase text-[11px] tracking-wider">
                      <th className="pb-3 font-medium">Document Name</th>
                      <th className="pb-3 font-medium">Vector Chunks</th>
                      <th className="pb-3 font-medium">Processing Time</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 font-medium flex items-center gap-2.5">
                          <div className="p-1.5 bg-primary/10 rounded-md text-primary group-hover:bg-primary/20 transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate max-w-[220px] sm:max-w-[320px]">{doc.filename}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">
                            {doc.chunks_count} chunks
                          </span>
                        </td>
                        <td className="py-3.5 text-muted-foreground">
                          {doc.upload_time ? `${parseFloat(doc.upload_time).toFixed(2)}s` : 'Instant'}
                        </td>
                        <td className="py-3.5 text-right">
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Col: Architecture & System Quick Info */}
          <div className="flex flex-col gap-6">
            {/* System Spec Card */}
            <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" /> RAG Architecture Specs
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Vector Store</span>
                  <span className="font-mono text-foreground font-medium">ChromaDB Local</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Embedding Model</span>
                  <span className="font-mono text-foreground font-medium">BAAI/bge-small-en</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Vector Dimensions</span>
                  <span className="font-mono text-foreground font-medium">384 Dimensions</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">LLM Provider</span>
                  <span className="font-mono text-foreground font-medium">Groq LPU Engine</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Auth Framework</span>
                  <span className="font-mono text-foreground font-medium">Supabase JWT (P-256)</span>
                </div>
              </div>
            </div>

            {/* Quick API Snippet Box */}
            <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> Developer API Access
                </h3>
                <button 
                  onClick={() => router.push('/api-docs')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  View Docs <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Integrate RagFlow's RAG pipeline directly into your custom apps using our REST API endpoints.
              </p>
              
              <div className="bg-muted/60 border border-border/50 rounded-xl p-3 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                <code>curl -X POST {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/query</code>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
