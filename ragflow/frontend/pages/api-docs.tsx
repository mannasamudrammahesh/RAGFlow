import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Code2, Copy, Check, Terminal, Play, Key, 
  Sparkles, Layers, FileText, Send, ShieldAlert, Cpu
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function APIDocs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [testQuestion, setTestQuestion] = useState('What is machine learning?');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [apiKey, setApiKey] = useState('rg_live_99f8a1e2d3c4b5a6');
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST "${API_BASE}/query" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "question": "${testQuestion}",
    "top_k": 5
  }'`,
    js: `import { RagFlowClient } from '@ragflow/sdk';

const client = new RagFlowClient({
  apiKey: '${apiKey}',
  baseUrl: '${API_BASE}'
});

const response = await client.query({
  question: '${testQuestion}',
  topK: 5
});

console.log(response.answer);
console.log(response.sources);`,
    python: `import requests

url = "${API_BASE}/query"
headers = {
    "Authorization": f"Bearer ${apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "question": "${testQuestion}",
    "top_k": 5
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Answer:", data["answer"])
print("Source Mode:", data["answer_source"])`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunPlayground = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_developer_token_xyz'
        },
        body: JSON.stringify({ question: testQuestion, top_k: 3 })
      });
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTestResponse(JSON.stringify({ error: e.message || 'Failed to connect to API server' }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  const generateNewKey = () => {
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`rg_live_${randomHex}`);
    setKeyGenerated(true);
    setTimeout(() => setKeyGenerated(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20">
      <Head>
        <title>API Reference & Developer Hub | RagFlow Intelligence</title>
        <meta name="description" content="Integrate RagFlow RAG pipeline endpoints into your application with cURL, JavaScript, and Python snippets." />
      </Head>

      {/* Background Gradients */}
      <div className="fixed inset-0 min-h-screen z-[-1] overflow-hidden bg-background pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      <Navbar />

      <main className="pt-28 md:pt-36 pb-20 px-6 max-w-[1300px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
            <Terminal className="w-3.5 h-3.5" /> REST API v2.0
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Developer API Reference
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Build context-aware AI experiences into your product using our high-speed RAG endpoints powered by Groq LPUs and vector retrieval.
          </p>
        </div>

        {/* API Key Box */}
        <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold text-base">Your Developer API Key</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Pass this key in the <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer &lt;key&gt;</code> header of your requests.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Integrated API Key container with copy action */}
            <div className="bg-muted/50 border border-border/60 rounded-lg pl-3 pr-1.5 py-1 font-mono text-xs text-primary flex items-center justify-between gap-3 flex-1 md:w-64 shadow-xs">
              <span className="truncate select-all">{apiKey}</span>
              <button
                onClick={handleCopyKey}
                className="p-1 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
                title="Copy API key"
              >
                {keyCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Roll Key Button */}
            <Button 
              onClick={generateNewKey} 
              variant="outline" 
              size="sm"
              className="h-8 px-2.5 rounded-lg text-xs gap-1.5 border-border/60 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{keyGenerated ? 'Regenerated' : 'Roll'}</span>
            </Button>
          </div>
        </div>

        {/* Code Snippets & Tabs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left: Code Snippets Box */}
          <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Query Endpoint Request</span>
              </div>

              {/* Language Tabs */}
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/40">
                {(['curl', 'js', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all uppercase ${
                      activeTab === lang
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Body */}
            <div className="relative bg-muted/60 border border-border/50 rounded-xl p-4 font-mono text-xs text-muted-foreground flex-1 overflow-x-auto">
              <button
                onClick={handleCopy}
                className="absolute right-3 top-3 p-1.5 rounded-lg bg-background/80 hover:bg-background border border-border/60 text-foreground transition-colors"
                title="Copy Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre className="whitespace-pre text-[12px] leading-relaxed text-foreground/90">
                {codeSnippets[activeTab]}
              </pre>
            </div>
          </div>

          {/* Right: Live Interactive Playground */}
          <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="font-semibold text-sm">Interactive API Playground</span>
              </div>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Live Endpoint</span>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Test Question</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testQuestion}
                    onChange={(e) => setTestQuestion(e.target.value)}
                    placeholder="Enter your question..."
                    className="flex-1 bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <Button 
                    onClick={handleRunPlayground}
                    disabled={isTesting || !testQuestion.trim()}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    {isTesting ? 'Executing...' : 'Execute'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Response Output Box */}
            <div className="flex-1 bg-muted/60 border border-border/50 rounded-xl p-4 font-mono text-[11px] overflow-auto max-h-[300px]">
              {testResponse ? (
                <pre className="text-emerald-400 whitespace-pre-wrap">{testResponse}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground/60 text-center py-10">
                  Click "Execute" above to send a live request to the RAG backend.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Endpoints Reference Table */}
        <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm mb-12">
          <h2 className="text-lg font-semibold tracking-tight mb-4">API Endpoints Overview</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground uppercase text-[11px] tracking-wider">
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Endpoint</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Auth Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <tr className="hover:bg-muted/20">
                  <td className="py-3 font-mono font-bold text-emerald-400">GET</td>
                  <td className="py-3 font-mono text-foreground">/health</td>
                  <td className="py-3 text-muted-foreground">Check server operational status and DB backend</td>
                  <td className="py-3 text-muted-foreground">No</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="py-3 font-mono font-bold text-blue-400">POST</td>
                  <td className="py-3 font-mono text-foreground">/upload</td>
                  <td className="py-3 text-muted-foreground">Upload and chunk document into user's vector store</td>
                  <td className="py-3 text-emerald-400 font-medium">Yes (Bearer JWT)</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="py-3 font-mono font-bold text-blue-400">POST</td>
                  <td className="py-3 font-mono text-foreground">/query</td>
                  <td className="py-3 text-muted-foreground">RAG query with auto document context + fallback detection</td>
                  <td className="py-3 text-emerald-400 font-medium">Yes (Bearer JWT)</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="py-3 font-mono font-bold text-emerald-400">GET</td>
                  <td className="py-3 font-mono text-foreground">/documents</td>
                  <td className="py-3 text-muted-foreground">List all documents uploaded by authenticated user</td>
                  <td className="py-3 text-emerald-400 font-medium">Yes (Bearer JWT)</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="py-3 font-mono font-bold text-rose-400">DELETE</td>
                  <td className="py-3 font-mono text-foreground">/documents/&#123;doc_id&#125;</td>
                  <td className="py-3 text-muted-foreground">Delete document and vector chunks from knowledge base</td>
                  <td className="py-3 text-emerald-400 font-medium">Yes (Bearer JWT)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
