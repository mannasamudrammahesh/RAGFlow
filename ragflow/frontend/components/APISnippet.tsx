import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface APISnippetProps {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description?: string;
  showMethod?: boolean;
}

const APISnippet = ({ 
  endpoint, 
  method = 'GET', 
  description,
  showMethod = true 
}: APISnippetProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full">
      {description && (
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
      )}
      <div className="relative group">
        <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg p-4 pr-12 hover:border-foreground/20 transition-colors">
          {showMethod && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
              method === 'POST' ? 'bg-green-500/20 text-green-400' :
              method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {method}
            </span>
          )}
          <code className="text-sm font-mono text-foreground flex-1 overflow-x-auto">
            {endpoint}
          </code>
        </div>
        
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md bg-background border border-border hover:bg-muted transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Copied notification */}
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-10 right-0 bg-foreground text-background text-xs px-3 py-1.5 rounded-md shadow-lg"
          >
            Copied!
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default APISnippet;

