import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Session } from '@/lib/supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UploadPanelProps {
  onUploadComplete?: (data: { filename: string; chunks_count: number; processing_time: number }) => void;
  session?: Session | null;
}

export default function UploadPanel({ onUploadComplete, session }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsUploading(true);
    toast.loading('Uploading and processing document...', { id: 'process-doc' });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Upload failed');
      }
      const data = await uploadRes.json();

      toast.success(`Document "${data.filename}" is ready! (${data.chunks_count} chunks)`, { id: 'process-doc' });
      window.dispatchEvent(new Event('refreshDocuments'));
      
      if (onUploadComplete) {
        onUploadComplete({
          filename: data.filename,
          chunks_count: data.chunks_count,
          processing_time: data.processing_time || 0,
        });
      }
      
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error processing document', { id: 'process-doc' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
      <div 
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleChange}
          accept=".pdf,.docx,.txt,.json"
        />
        
        {isUploading ? (
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
        ) : (
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
        )}
        
        <p className="font-medium mb-1">
          {isUploading ? 'Processing document...' : 'Click or drag file to this area to upload'}
        </p>
        <p className="text-sm text-muted-foreground">
          Supported formats: PDF, DOCX, TXT, JSON
        </p>
      </div>
    </div>
  );
}
