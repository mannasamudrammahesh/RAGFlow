import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, BookOpen, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResponseViewerProps {
  answer: string;
  sources?: any[];
  answerSource?: 'document' | 'external' | 'none';
}

export default function ResponseViewer({ answer, sources = [], answerSource }: ResponseViewerProps) {
  const [showSources, setShowSources] = useState(false);

  const isExternal = answerSource === 'external';

  return (
    <div className="flex flex-col gap-3">
      {/* Source badge */}
      {answerSource && answerSource !== 'none' && (
        <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit ${
          isExternal
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        }`}>
          {isExternal ? (
            <><Globe className="h-3 w-3" /> External Knowledge</>
          ) : (
            <><BookOpen className="h-3 w-3" /> From Your Documents</>
          )}
        </div>
      )}
      <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed text-[15px]">
        <ReactMarkdown
          components={{
            // Make sure links open in new tab
            a: ({ node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
            // Style code blocks nicely inside the chat bubble
            code: ({ node, className, children, ...props }) => {
              const isBlock = className?.includes('language-');
              return isBlock ? (
                <pre className="bg-muted/60 rounded-lg p-3 overflow-x-auto text-[13px]">
                  <code className={className} {...props}>{children}</code>
                </pre>
              ) : (
                <code className="bg-muted/60 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>

      
      {sources && sources.length > 0 && (
        <div className="mt-3 border-t border-border/50 pt-3">
          <button 
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium bg-muted/40 px-3 py-1.5 rounded-full"
          >
            <FileText className="h-3.5 w-3.5" />
            {showSources ? 'Hide Sources' : `View ${sources.length} Sources`}
            {showSources ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          
          {showSources && (
            <div className="mt-4 flex flex-col gap-3">
              {sources.map((source, i) => {
                // Backend returns: { filename: string, chunk_index: number }
                const filename = source?.filename || source?.metadata?.source || 'Source Document';
                const chunkIndex = source?.chunk_index ?? source?.metadata?.chunk_index;
                return (
                  <div key={i} className="bg-muted/40 border border-border/50 rounded-lg p-3.5 text-xs transition-colors hover:border-primary/30 hover:bg-muted/60">
                    <div className="font-semibold text-primary mb-1 flex justify-between items-center text-[13px]">
                      <span className="flex items-center gap-1.5 truncate max-w-[80%]">
                        <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{filename}</span>
                      </span>
                      {chunkIndex !== undefined && (
                        <span className="bg-background px-2 py-0.5 rounded text-muted-foreground shrink-0 ml-2">
                          Chunk {chunkIndex + 1}
                        </span>
                      )}
                    </div>
                    {source?.chunk_text && (
                      <p className="text-muted-foreground leading-relaxed line-clamp-3 mt-1.5">
                        {source.chunk_text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
