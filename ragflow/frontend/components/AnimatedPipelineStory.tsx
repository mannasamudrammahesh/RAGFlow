import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Database, Settings, Bot, Rocket, Check, 
  Upload, ChevronRight, ArrowRight, Circle, Link as LinkIcon, Copy
} from "lucide-react";

const AnimatedPipelineStory = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [droppedFiles, setDroppedFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [endpointCopied, setEndpointCopied] = useState(false);
  
  // Config state
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(50);
  const [embedding, setEmbedding] = useState("openai");
  const [vectorDb, setVectorDb] = useState("pinecone");

  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/#how-it-works`;
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyEndpoint = async () => {
    try {
      const endpoint = 'api.ragflow.com/v1/agent/abc123';
      await navigator.clipboard.writeText(endpoint);
      setEndpointCopied(true);
      setTimeout(() => setEndpointCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy endpoint:', err);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate file drop
    const newFiles = ["document.pdf", "data.csv", "notes.txt"];
    setDroppedFiles(newFiles);
    
    // Auto advance after files are dropped
    setTimeout(() => {
      setActiveStep(1);
    }, 1500);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const simulateDrop = () => {
    const newFiles = ["document.pdf", "data.csv", "notes.txt"];
    setDroppedFiles(newFiles);
    setTimeout(() => {
      setActiveStep(1);
    }, 1500);
  };

  const handleConfigNext = () => {
    setActiveStep(2);
  };

  const handleGenerateNext = () => {
    setActiveStep(3);
  };

  const resetDemo = () => {
    setActiveStep(0);
    setDroppedFiles([]);
    setChunkSize(512);
    setOverlap(50);
    setEmbedding("openai");
    setVectorDb("pinecone");
  };

  const steps = [
    { id: 0, label: "Upload", icon: Upload },
    { id: 1, label: "Configure", icon: Settings },
    { id: 2, label: "Generate", icon: Bot },
    { id: 3, label: "Deploy", icon: Rocket },
  ];

  return (
    <section id="how-it-works" className="section-padding overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="relative group">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-semibold text-center mb-4 inline-flex items-center gap-3 w-full justify-center"
          >
            How RagFlow Works
            
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg"
              aria-label="Copy link to this section"
              title="Copy link"
            >
              {linkCopied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <LinkIcon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          </motion.h2>

          {/* Copied notification */}
          <AnimatePresence>
            {linkCopied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 bg-foreground text-background text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
              >
                Link copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
        >
          Experience the pipeline from data to deployment.
        </motion.p>

        {/* Step Indicators - Simple dots */}
        <div className="flex justify-center items-center gap-2 mb-10">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setActiveStep(index)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                  activeStep === index 
                    ? "bg-foreground text-background" 
                    : activeStep > index
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeStep > index ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <step.icon className="w-3.5 h-3.5" />
                )}
                <span className="hidden md:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Main Stage */}
        <div className="relative min-h-[420px] rounded-2xl border border-border bg-card overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* Step 0: Drag & Drop */}
            {activeStep === 0 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 flex flex-col"
              >
                <h3 className="text-lg font-medium mb-6">1. Connect Your Data</h3>
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={simulateDrop}
                  className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragging 
                      ? "border-foreground bg-muted/30" 
                      : droppedFiles.length > 0
                      ? "border-muted bg-muted/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  {droppedFiles.length === 0 ? (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Drag & drop your files here
                      </p>
                      <p className="text-muted-foreground/60 text-sm mt-1">
                        or click to simulate upload
                      </p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {droppedFiles.map((file, i) => (
                        <motion.div
                          key={file}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-lg"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{file}</span>
                          <Check className="w-4 h-4 text-success ml-2" />
                        </motion.div>
                      ))}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-muted-foreground text-center mt-4"
                      >
                        Processing...
                      </motion.p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 1: Configure */}
            {activeStep === 1 && (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 flex flex-col"
              >
                <h3 className="text-lg font-medium mb-6">2. Configure Pipeline</h3>
                
                <div className="grid md:grid-cols-2 gap-6 flex-1">
                  {/* Chunk Size */}
                  <div className="space-y-3">
                    <label className="text-sm text-muted-foreground">Chunk Size</label>
                    <input
                      type="range"
                      min="128"
                      max="2048"
                      step="128"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(Number(e.target.value))}
                      className="w-full accent-foreground"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">128</span>
                      <span className="font-mono bg-secondary px-2 py-0.5 rounded">{chunkSize}</span>
                      <span className="text-muted-foreground">2048</span>
                    </div>
                  </div>

                  {/* Overlap */}
                  <div className="space-y-3">
                    <label className="text-sm text-muted-foreground">Overlap %</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={overlap}
                      onChange={(e) => setOverlap(Number(e.target.value))}
                      className="w-full accent-foreground"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">0%</span>
                      <span className="font-mono bg-secondary px-2 py-0.5 rounded">{overlap}%</span>
                      <span className="text-muted-foreground">50%</span>
                    </div>
                  </div>

                  {/* Embedding Model */}
                  <div className="space-y-3">
                    <label className="text-sm text-muted-foreground">Embedding Model</label>
                    <div className="flex gap-2">
                      {["openai", "cohere", "huggingface"].map((model) => (
                        <button
                          key={model}
                          onClick={() => setEmbedding(model)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            embedding === model
                              ? "bg-foreground text-background"
                              : "bg-secondary hover:bg-muted"
                          }`}
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vector DB */}
                  <div className="space-y-3">
                    <label className="text-sm text-muted-foreground">Vector Database</label>
                    <div className="flex gap-2">
                      {["pinecone", "weaviate", "qdrant"].map((db) => (
                        <button
                          key={db}
                          onClick={() => setVectorDb(db)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            vectorDb === db
                              ? "bg-foreground text-background"
                              : "bg-secondary hover:bg-muted"
                          }`}
                        >
                          {db}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleConfigNext}
                    className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Generate - Connection Diagram */}
            {activeStep === 2 && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 flex flex-col"
              >
                <h3 className="text-lg font-medium mb-6">3. Generate AI Agent</h3>
                
                {/* Connection Flow Diagram */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-4 md:gap-8">
                    {/* Data Source */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-xl border border-border bg-secondary flex items-center justify-center">
                        <Database className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">Data</span>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center"
                    >
                      <div className="w-8 md:w-16 h-px bg-border" />
                      <Circle className="w-2 h-2 text-muted-foreground fill-current" />
                    </motion.div>

                    {/* Chunker */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-xl border border-border bg-secondary flex items-center justify-center">
                        <div className="text-xs font-mono text-muted-foreground">{chunkSize}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">Chunker</span>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center"
                    >
                      <div className="w-8 md:w-16 h-px bg-border" />
                      <Circle className="w-2 h-2 text-muted-foreground fill-current" />
                    </motion.div>

                    {/* Embeddings */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-xl border border-border bg-secondary flex items-center justify-center">
                        <div className="text-[10px] font-mono text-muted-foreground text-center leading-tight">
                          {embedding}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Embed</span>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center"
                    >
                      <div className="w-8 md:w-16 h-px bg-border" />
                      <Circle className="w-2 h-2 text-muted-foreground fill-current" />
                    </motion.div>

                    {/* Vector DB */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-xl border border-border bg-secondary flex items-center justify-center">
                        <div className="text-[10px] font-mono text-muted-foreground text-center leading-tight">
                          {vectorDb}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Store</span>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center"
                    >
                      <div className="w-8 md:w-16 h-px bg-border" />
                      <Circle className="w-2 h-2 text-muted-foreground fill-current" />
                    </motion.div>

                    {/* LLM Agent */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-xl border border-foreground/20 bg-foreground/5 flex items-center justify-center">
                        <Bot className="w-7 h-7" />
                      </div>
                      <span className="text-xs">Agent</span>
                    </motion.div>
                  </div>
                </div>

                {/* Config Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-4 p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Chunks: <span className="text-foreground font-mono">{chunkSize}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Overlap: <span className="text-foreground font-mono">{overlap}%</span>
                    </span>
                    <span className="text-muted-foreground">
                      Model: <span className="text-foreground font-mono">{embedding}</span>
                    </span>
                    <span className="text-muted-foreground">
                      DB: <span className="text-foreground font-mono">{vectorDb}</span>
                    </span>
                  </div>
                </motion.div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleGenerateNext}
                    className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Deploy Agent
                    <Rocket className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Deployed - Simple Message */}
            {activeStep === 3 && (
              <motion.div
                key="deploy"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Check className="w-16 h-16 text-success mb-6" />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-semibold mb-2"
                >
                  Agent Deployed
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mb-8"
                >
                  Your RAG agent is live and ready to use.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-4"
                >
                  {/* API Endpoint with Copy */}
                  <div className="relative group">
                    <div 
                      onClick={handleCopyEndpoint}
                      className="px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg font-mono text-sm text-blue-400 cursor-pointer hover:border-blue-500/50 transition-all flex items-center gap-3"
                    >
                      <span>api.ragflow.com/v1/agent/abc123</span>
                      {endpointCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    
                    {/* Copied notification */}
                    <AnimatePresence>
                      {endpointCopied && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
                        >
                          Endpoint copied!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={resetDemo}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Run demo again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AnimatedPipelineStory;
