import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import UploadPanel from '@/components/UploadPanel';
import DocumentList from '@/components/DocumentList';
import ChatInterface from '@/components/ChatInterface';
import PipelineVisualization from '@/components/PipelineVisualization';
import { useAuth } from '@/context/AuthContext';

export default function AppDashboard() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [showPipeline, setShowPipeline] = useState(false);
  const [uploadData, setUploadData] = useState<{
    filename: string;
    chunks_count: number;
    processing_time: number;
  } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleUploadComplete = (data: { filename: string; chunks_count: number; processing_time: number }) => {
    setUploadData(data);
    setShowPipeline(true);
  };

  // Show spinner while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent any body/window scrolling when on Workspace page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col bg-background selection:bg-primary/20">
      <Head>
        <title>Workspace | RagFlow Intelligence</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      
      {/* Background gradients */}
      <div className="fixed inset-0 min-h-screen z-[-1] overflow-hidden bg-background pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <Navbar />
      
      <main className="pt-14 md:pt-16 pb-4 px-6 max-w-[1600px] w-full mx-auto flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="mb-3 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Workspace</h1>
          <p className="text-xs text-muted-foreground">
            Welcome back, <span className="text-foreground font-medium">{user.user_metadata?.full_name || user.email}</span>
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 overflow-hidden">
          {/* Sidebar: Upload, Pipeline & Documents */}
          <div className="w-full lg:w-[310px] flex flex-col gap-4 shrink-0 overflow-y-auto pr-1">
            <UploadPanel onUploadComplete={handleUploadComplete} session={session} />
            
            {/* Pipeline Visualization - shows after upload */}
            <PipelineVisualization 
              isVisible={showPipeline} 
              onClose={() => setShowPipeline(false)}
              uploadData={uploadData}
            />
            
            <DocumentList session={session} />
          </div>
          
          {/* Main: Chat (Sticky fixed height, internal scroll) */}
          <div className="w-full lg:flex-1 h-full min-h-0 flex flex-col">
            <ChatInterface session={session} />
          </div>
        </div>
      </main>
    </div>
  );
}
