import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentDeployedSuccessProps {
  agentId?: string;
  onRunDemoAgain?: () => void;
}

const AgentDeployedSuccess = ({ 
  agentId = "abc123",
  onRunDemoAgain 
}: AgentDeployedSuccessProps) => {
  const [copied, setCopied] = useState(false);
  const endpoint = `api.ragflow.com/v1/agent/${agentId}`;

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
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full border border-border rounded-3xl p-12 text-center bg-card/30 backdrop-blur"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-12 h-12 text-green-500 stroke-[3]" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Agent Deployed
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground mb-12"
        >
          Your RAG agent is live and ready to use.
        </motion.p>

        {/* API Endpoint with Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative mb-8"
        >
          <div className="group">
            <div 
              onClick={handleCopy}
              className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-6 py-4 font-mono text-blue-400 text-lg cursor-pointer hover:border-blue-500/50 transition-all relative overflow-hidden"
            >
              {/* Hover effect */}
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Text */}
              <span className="relative">{endpoint}</span>

              {/* Copy Icon */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="text-green-500"
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Copied notification */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
                >
                  Copied to clipboard!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Run Demo Again Button */}
        {onRunDemoAgain && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onRunDemoAgain}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Run demo again
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default AgentDeployedSuccess;

