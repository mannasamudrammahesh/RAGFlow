import { useState, useEffect } from 'react';
import { FileText, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Session } from '@/lib/supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Document {
  id: string;
  filename: string;
  upload_time: string;
  chunks_count?: number;
}

interface DocumentListProps {
  session?: Session | null;
}

export default function DocumentList({ session }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const authHeaders = (): Record<string, string> => {
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
    return {};
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/documents`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error('Failed to fetch documents', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    const handler = () => fetchDocuments();
    window.addEventListener('refreshDocuments', handler);
    return () => window.removeEventListener('refreshDocuments', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        toast.success('Document deleted');
        fetchDocuments();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (e) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm flex-1 flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Knowledge Base</h2>
        <Button variant="ghost" size="icon" onClick={fetchDocuments} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {isLoading && documents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-6">
          <FileText className="h-10 w-10 mb-2 opacity-20" />
          <p className="text-sm">No documents uploaded yet.</p>
          <p className="text-xs mt-1 opacity-60">Upload a file above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2 max-h-[400px]">
          {documents.map((doc) => (
            <div key={doc.id} className="group flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-8 w-8 text-primary/70 shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-medium truncate" title={doc.filename}>{doc.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.chunks_count ? `${doc.chunks_count} chunks · ` : ''}
                    Processed in {parseFloat(doc.upload_time).toFixed(1)}s
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(doc.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
