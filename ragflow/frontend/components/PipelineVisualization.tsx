import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  SplitSquareHorizontal,
  Brain,
  Database,
  Search,
  MessageSquare,
  CheckCircle2,
  ArrowDown,
  X,
  Sparkles,
} from 'lucide-react';

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  detail?: string;
}

interface PipelineVisualizationProps {
  isVisible: boolean;
  onClose: () => void;
  uploadData?: {
    filename: string;
    chunks_count: number;
    processing_time: number;
  } | null;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'upload',
    label: 'Document Upload',
    description: 'User uploads a PDF, DOCX, TXT, or JSON file to the server.',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'extract',
    label: 'Text Extraction',
    description: 'Raw text is extracted from the document using PyPDF2, python-docx, or direct parsing.',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'chunk',
    label: 'Chunking',
    description: 'Text is split into overlapping chunks (800 chars, 150 overlap) for optimal retrieval.',
    icon: <SplitSquareHorizontal className="h-5 w-5" />,
  },
  {
    id: 'embed',
    label: 'Embedding Generation',
    description: 'Each chunk is converted to a 384-dim vector using BAAI/bge-small-en SentenceTransformer.',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: 'store',
    label: 'Vector Storage',
    description: 'Embeddings are stored in ChromaDB with cosine similarity indexing for fast retrieval.',
    icon: <Database className="h-5 w-5" />,
  },
  {
    id: 'query',
    label: 'Query & Retrieval',
    description: 'User question is embedded and Top-5 most similar chunks are retrieved from the vector store.',
    icon: <Search className="h-5 w-5" />,
  },
  {
    id: 'generate',
    label: 'LLM Answer Generation',
    description: 'Retrieved chunks + question are sent to Llama 3.2 3B Instruct to generate a grounded answer.',
    icon: <MessageSquare className="h-5 w-5" />,
  },
];

export default function PipelineVisualization({ isVisible, onClose, uploadData }: PipelineVisualizationProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setActiveStep(-1);
      setCompleted(false);
      return;
    }

    // Animate steps one by one
    let stepTimer: NodeJS.Timeout;
    const animateSteps = () => {
      let step = 0;
      stepTimer = setInterval(() => {
        if (step < PIPELINE_STEPS.length) {
          setActiveStep(step);
          step++;
        } else {
          setCompleted(true);
          clearInterval(stepTimer);
        }
      }, 600);
    };

    // Small delay before starting animation
    const startDelay = setTimeout(animateSteps, 300);
    return () => {
      clearTimeout(startDelay);
      clearInterval(stepTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-card border border-border/50 rounded-xl p-6 shadow-lg relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">RAG Pipeline Visualization</h2>
        </div>

        {/* Upload details badge */}
        {uploadData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg inline-flex flex-wrap items-center gap-2 text-xs md:text-sm w-full"
          >
            <span className="text-foreground font-medium truncate max-w-[160px]" title={uploadData.filename}>
              {uploadData.filename}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground whitespace-nowrap">{uploadData.chunks_count} chunks</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground whitespace-nowrap">{uploadData.processing_time.toFixed(2)}s</span>
          </motion.div>
        )}

        {/* Pipeline Steps */}
        <div className="space-y-1">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = idx <= activeStep;
            const isCurrent = idx === activeStep;
            const isIngestion = idx <= 4; // steps 0-4 are ingestion, 5-6 are query

            return (
              <div key={step.id}>
                <motion.div
                  initial={{ opacity: 0.3, x: -10 }}
                  animate={{
                    opacity: isActive ? 1 : 0.3,
                    x: isActive ? 0 : -10,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`flex items-start gap-4 p-3 rounded-lg transition-colors duration-300 ${
                    isCurrent ? 'bg-primary/10 border border-primary/20' : isActive ? 'bg-muted/30' : ''
                  }`}
                >
                  {/* Step number / check */}
                  <div
                    className={`flex items-center justify-center h-9 w-9 rounded-full shrink-0 transition-all duration-300 ${
                      isActive && !isCurrent
                        ? 'bg-green-500/20 text-green-400'
                        : isCurrent
                        ? 'bg-primary/20 text-primary ring-2 ring-primary/40'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {isActive && !isCurrent ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-xs text-primary font-medium"
                        >
                          Processing...
                        </motion.span>
                      )}
                      {idx === 4 && isActive && !isCurrent && (
                        <span className="text-xs text-green-400 font-medium">Ingestion Complete</span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                      {step.description}
                    </p>
                    {/* Dynamic details */}
                    {isActive && uploadData && idx === 2 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-primary mt-1 truncate max-w-full block"
                        title={`→ Generated ${uploadData.chunks_count} chunks from "${uploadData.filename}"`}
                      >
                        → Generated {uploadData.chunks_count} chunks from "{uploadData.filename}"
                      </motion.p>
                    )}
                    {isActive && idx === 3 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-primary mt-1"
                      >
                        → Model: BAAI/bge-small-en (384 dimensions per chunk)
                      </motion.p>
                    )}
                    {isActive && idx === 4 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-primary mt-1"
                      >
                        → Stored in ChromaDB collection "ragflow_documents"
                      </motion.p>
                    )}
                    {isActive && idx === 6 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-primary mt-1"
                      >
                        → LLM: qwen/qwen3.8-27b via Groq
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* Separator line between ingestion and query */}
                {idx === 4 && (
                  <div className="flex items-center gap-2 py-2 pl-6">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className={`text-[10px] uppercase tracking-wider font-medium px-2 ${
                      activeStep >= 5 ? 'text-primary' : 'text-muted-foreground/40'
                    }`}>
                      Query Phase
                    </span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                )}

                {/* Arrow between steps (except last and before separator) */}
                {idx < PIPELINE_STEPS.length - 1 && idx !== 4 && (
                  <div className="flex justify-start pl-7 py-0.5">
                    <ArrowDown className={`h-3 w-3 ${
                      idx < activeStep ? 'text-green-400/60' : 'text-muted-foreground/20'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Complete message */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="font-medium text-green-400">Pipeline Ready!</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your document has been processed through all 5 ingestion stages. 
                Ask a question in the chat to trigger the Query & LLM stages!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
