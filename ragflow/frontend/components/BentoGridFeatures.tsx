import { Database, Settings, Shield, Globe, Zap, Box, Code, FileText, FileCode, FileSpreadsheet, Globe2 } from "lucide-react";
import { useEffect, useState } from "react";

const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const startTimeout = setTimeout(() => {
      const type = () => {
        if (!isDeleting) {
          // Typing
          if (index <= text.length) {
            setDisplayedText(text.slice(0, index));
            index++;
            timeoutId = setTimeout(type, 80);
          } else {
            // Pause at end, then start deleting
            timeoutId = setTimeout(() => {
              isDeleting = true;
              type();
            }, 2000);
          }
        } else {
          // Deleting
          if (index > 0) {
            index--;
            setDisplayedText(text.slice(0, index));
            timeoutId = setTimeout(type, 40);
          } else {
            // Pause, then start typing again
            isDeleting = false;
            timeoutId = setTimeout(type, 500);
          }
        }
      };

      type();
    }, delay);

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
  }, [text, delay]);

  return (
    <span>
      {displayedText}
      <span className={`text-highlight ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
    </span>
  );
};

const MultiLineTyping = ({ lines, delay = 0 }: { lines: string[]; delay?: number }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>(lines.map(() => ""));
  const [cursorLine, setCursorLine] = useState(0);

  useEffect(() => {
    let currentLineIndex = 0;
    let charIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const startTimeout = setTimeout(() => {
      const typeChar = () => {
        if (currentLineIndex < lines.length) {
          const line = lines[currentLineIndex];
          if (charIndex <= line.length) {
            setDisplayedLines(prev => {
              const newLines = [...prev];
              newLines[currentLineIndex] = line.slice(0, charIndex);
              return newLines;
            });
            setCursorLine(currentLineIndex);
            charIndex++;
            timeoutId = setTimeout(typeChar, 60);
          } else {
            // Move to next line
            charIndex = 0;
            currentLineIndex++;
            if (currentLineIndex < lines.length) {
              timeoutId = setTimeout(typeChar, 200);
            } else {
              // All done, reset after delay
              timeoutId = setTimeout(() => {
                currentLineIndex = 0;
                charIndex = 0;
                setDisplayedLines(lines.map(() => ""));
                setCursorLine(0);
                typeChar();
              }, 3000);
            }
          }
        }
      };

      typeChar();
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
    };
  }, [lines, delay]);

  return (
    <div>
      {lines.map((line, i) => (
        <div key={i} className="h-5">
          {displayedLines[i]}
          {i === cursorLine && displayedLines[i].length < line.length && (
            <span className="animate-pulse text-highlight">|</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Data Ingestion Animation Component
const DataIngestionAnimation = () => {
  const fileTypes = [
    { icon: FileText, label: 'PDF', angle: 0, color: 'text-red-400/70' },
    { icon: FileCode, label: 'JSON', angle: 72, color: 'text-yellow-400/70' },
    { icon: FileSpreadsheet, label: 'SQL', angle: 144, color: 'text-blue-400/70' },
    { icon: Globe2, label: 'API', angle: 216, color: 'text-green-400/70' },
    { icon: FileText, label: 'DOC', angle: 288, color: 'text-purple-400/70' },
  ];

  return (
    <div className="relative w-44 h-44">
      {/* Static rings */}
      <div className="absolute inset-0 border border-muted-foreground/20 rounded-full" />
      <div className="absolute inset-6 border border-muted-foreground/15 rounded-full" />
      <div className="absolute inset-12 border border-muted-foreground/10 rounded-full" />
      
      {/* Center database icon */}
      <div className="absolute inset-[60px] rounded-full bg-muted/40 flex items-center justify-center border border-muted-foreground/20">
        <Database className="w-6 h-6 text-highlight" />
      </div>
      
      {/* File icons that flow to center */}
      {fileTypes.map((file, i) => {
        const Icon = file.icon;
        const angleRad = (file.angle - 90) * (Math.PI / 180);
        const radius = 85;
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;
        
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%)`,
            }}
          >
            {/* File card that animates */}
            <div
              className="flex flex-col items-center gap-0.5 p-1.5 rounded border border-border bg-card/80"
              style={{
                animation: `file-ingest 3s ease-in-out ${i * 0.6}s infinite`,
                '--start-x': `${x}px`,
                '--start-y': `${y}px`,
              } as React.CSSProperties}
            >
              <Icon className={`w-4 h-4 ${file.color}`} />
              <span className="text-[8px] text-muted-foreground font-medium">{file.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BentoGridFeatures = () => {
  return (
    <section id="features" className="section-padding bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          What RagFlow Enables
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Everything you need to build intelligent systems, without the complexity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large Card - Data Ingestion */}
          <div className="bento-card md:row-span-2 flex flex-col min-h-[320px]">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Data Ingestion</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Every project gets <span className="text-highlight font-medium">unified data processing</span>, 
              from documents to databases.
            </p>
            
            {/* Animated Visual Element */}
            <div className="flex-1 flex items-center justify-center">
              <DataIngestionAnimation />
            </div>
            
            <div className="mt-auto pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-highlight">✓</span>
                <span>PDFs, Docs, SQL</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-highlight">✓</span>
                <span>APIs & Webhooks</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-highlight">✓</span>
                <span>Web Scraping</span>
              </div>
            </div>
          </div>
          
          {/* Card 2 - Embeddings */}
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-3">
              <Box className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Embeddings</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Generate and manage embeddings with <span className="text-highlight font-medium">full model control</span>.
            </p>
            
            {/* Visual: Centered Text to Vector Pipeline */}
            <div className="mt-5 flex items-center justify-center gap-3">
              {/* Input - Typing text */}
              <div className="w-14 h-8 bg-secondary rounded border border-border flex items-center justify-center overflow-hidden">
                <span className="text-[10px] font-mono text-muted-foreground typing-text">
                  Hello
                </span>
              </div>
              
              {/* Arrow with flowing dot */}
              <div className="relative w-8 flex items-center justify-center">
                <span className="text-muted-foreground/40">→</span>
                <div className="absolute w-1 h-1 rounded-full bg-highlight flowing-dot-1" />
              </div>
              
              {/* Transform box */}
              <div className="w-9 h-9 rounded-lg bg-highlight/10 border border-highlight/40 flex items-center justify-center">
                <Box className="w-4 h-4 text-highlight processing-icon" />
              </div>
              
              {/* Arrow with flowing dot */}
              <div className="relative w-8 flex items-center justify-center">
                <span className="text-muted-foreground/40">→</span>
                <div className="absolute w-1 h-1 rounded-full bg-highlight flowing-dot-2" />
              </div>
              
              {/* Output - Vector numbers */}
              <div className="h-8 bg-highlight/10 rounded border border-highlight/30 flex items-center justify-center px-2 overflow-hidden">
                <span className="text-[9px] font-mono text-highlight vector-output">
                  [0.82, 0.41]
                </span>
              </div>
            </div>
          </div>
          
          {/* Card 3 - Vector Store */}
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Vector Store</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Built-in vector database for <span className="text-highlight font-medium">fast semantic search</span>.
            </p>
            
            {/* Visual: Semantic search animation */}
            <div className="mt-4 relative h-24">
              {/* Search query */}
              <div className="absolute left-0 top-0 text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded search-query">
                "find similar"
              </div>
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ top: '10px' }}>
                {/* Lines from query to nodes */}
                <line x1="70" y1="8" x2="40" y2="45" className="stroke-muted-foreground/20" strokeWidth="1" />
                <line x1="70" y1="8" x2="90" y2="40" className="stroke-muted-foreground/20" strokeWidth="1" />
                <line x1="70" y1="8" x2="140" y2="35" className="stroke-muted-foreground/20" strokeWidth="1" />
                <line x1="40" y1="45" x2="90" y2="40" className="stroke-muted-foreground/20" strokeWidth="1" />
                <line x1="90" y1="40" x2="140" y2="35" className="stroke-muted-foreground/20" strokeWidth="1" />
                <line x1="40" y1="45" x2="60" y2="75" className="stroke-muted-foreground/20" strokeWidth="1" />
                <line x1="90" y1="40" x2="120" y2="70" className="stroke-muted-foreground/20" strokeWidth="1" />
                
                {/* Animated search pulse */}
                <circle r="4" className="fill-highlight/60 search-pulse">
                  <animate attributeName="r" values="2;6;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>
                
                {/* Traveling search dot */}
                <circle r="3" className="fill-highlight">
                  <animateMotion dur="2.5s" repeatCount="indefinite" keyPoints="0;0.3;0.6;1" keyTimes="0;0.3;0.7;1">
                    <mpath href="#searchPathNew" />
                  </animateMotion>
                </circle>
                <path id="searchPathNew" d="M70,8 Q50,25 40,45 Q65,55 90,40 L140,35" fill="none" className="hidden" />
              </svg>
              
              {/* Vector nodes */}
              <div className="absolute w-3 h-3 rounded-full bg-muted-foreground/40 node-idle" style={{ left: '35px', top: '50px' }} />
              <div className="absolute w-4 h-4 rounded-full bg-highlight/70 border-2 border-highlight node-match" style={{ left: '85px', top: '45px' }} />
              <div className="absolute w-3 h-3 rounded-full bg-muted-foreground/40 node-idle" style={{ left: '135px', top: '40px' }} />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-muted-foreground/30 node-idle" style={{ left: '55px', top: '80px' }} />
              <div className="absolute w-3 h-3 rounded-full bg-muted-foreground/35 node-idle" style={{ left: '115px', top: '75px' }} />
              
              {/* Match label */}
              <div className="absolute right-0 bottom-0 text-[8px] font-mono text-highlight bg-highlight/10 px-1.5 py-0.5 rounded border border-highlight/20 match-label">
                98% match
              </div>
            </div>
          </div>
          
          {/* Card 4 - RAG Pipeline with typing animation */}
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">RAG Pipeline</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Configure chunking, retrieval, and generation with <span className="text-highlight font-medium">no black boxes</span>.
            </p>
            
            {/* Visual: Terminal with typing */}
            <div className="mt-4 bg-background rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-highlight">$</span>
                <span className="text-muted-foreground">
                  <TypingText text="ragflow pipeline configure" delay={500} />
                </span>
              </div>
            </div>
          </div>
          
          {/* Card 5 - Multi-tenant */}
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Multi-tenant</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Isolated data per customer with <span className="text-highlight font-medium">enterprise security</span>.
            </p>
            
            {/* Visual: Isolated tenant containers */}
            <div className="mt-4 flex gap-3">
              {[
                { letter: "A", hoverColor: "hover:border-purple-500 hover:bg-purple-500/10", dotColor: "group-hover:bg-purple-400" },
                { letter: "B", hoverColor: "hover:border-blue-500 hover:bg-blue-500/10", dotColor: "group-hover:bg-blue-400" },
                { letter: "C", hoverColor: "hover:border-emerald-500 hover:bg-emerald-500/10", dotColor: "group-hover:bg-emerald-400" },
              ].map((tenant, i) => (
                <div 
                  key={tenant.letter}
                  className="relative flex-1 group cursor-pointer"
                >
                  {/* Container */}
                  <div 
                    className={`w-full h-14 rounded border border-border bg-secondary/30 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${tenant.hoverColor}`}
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{tenant.letter}</span>
                    {/* Data packets inside */}
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((j) => (
                        <div 
                          key={j}
                          className={`w-1.5 h-1.5 rounded-sm bg-highlight/50 data-packet transition-colors ${tenant.dotColor}`}
                          style={{ animationDelay: `${i * 0.3 + j * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Lock icon */}
                  <div 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-background border border-highlight/40 flex items-center justify-center lock-icon group-hover:border-foreground/50 group-hover:scale-110 transition-all"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <Shield className="w-2 h-2 text-highlight group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Card 6 - Deploy Anywhere - Wide */}
          <div className="bento-card md:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Deploy Anywhere</h3>
                </div>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Website widgets, internal tools, APIs — deploy your 
                  <span className="text-highlight font-medium"> intelligence wherever</span> you need it.
                </p>
              </div>
              
              {/* Visual: Deployment targets with icons */}
              <div className="flex items-center gap-4">
                {[
                  { icon: Globe, label: "Web", delay: 0 },
                  { icon: Code, label: "API", delay: 0.15 },
                  { icon: Box, label: "Apps", delay: 0.3 },
                ].map((target, i) => {
                  const Icon = target.icon;
                  return (
                    <div 
                      key={target.label}
                      className="group cursor-pointer deploy-target flex flex-col items-center"
                      style={{ animationDelay: `${target.delay}s` }}
                    >
                      <div className="relative w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center group-hover:border-highlight group-hover:bg-highlight/10 transition-all duration-300 group-hover:scale-110">
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-highlight transition-colors" />
                        {/* Live ping */}
                        <div 
                          className="absolute w-2 h-2 rounded-full bg-emerald-500 -top-0.5 -right-0.5 deploy-ping"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors mt-2">{target.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Card 7 - SDK with typing animation */}
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">SDK & APIs</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Instant <span className="text-highlight font-medium">RESTful APIs</span> and native SDKs.
            </p>
            
            {/* Visual: Code snippet with typing */}
            <div className="mt-4 bg-background rounded-lg p-3 border border-border">
              <pre className="text-xs font-mono text-muted-foreground">
                <MultiLineTyping 
                  lines={["import ragflow", "client.chat()"]} 
                  delay={1000} 
                />
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGridFeatures;
