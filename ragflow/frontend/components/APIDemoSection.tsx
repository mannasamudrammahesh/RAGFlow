import { motion } from "framer-motion";
import APISnippet from "./APISnippet";
import { Code2, Zap, Lock, Globe } from "lucide-react";

const APIDemoSection = () => {
  return (
    <section id="api" className="section-padding bg-card/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 bg-background/50 mb-6">
            <Code2 className="w-4 h-4 text-highlight" />
            <span className="text-sm">Developer-First API</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Simple, Powerful API
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Integrate RAG capabilities into your application with just a few lines of code.
          </p>
        </motion.div>

        {/* API Examples */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-6 mb-12"
        >
          {/* Chat Endpoint */}
          <div className="bg-background/50 border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-highlight" />
              Query Your Agent
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Send queries to your RAG agent and get intelligent responses
            </p>
            <APISnippet
              endpoint="api.ragflow.com/v1/agent/abc123/chat"
              method="POST"
            />
            
            {/* Example payload */}
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Example Request:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "query": "What are the key features?",
  "stream": true,
  "context_limit": 5
}`}
              </pre>
            </div>
          </div>

          {/* Upload Endpoint */}
          <div className="bg-background/50 border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-highlight" />
              Upload Documents
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ingest documents and build your knowledge base
            </p>
            <APISnippet
              endpoint="api.ragflow.com/v1/agent/abc123/documents"
              method="POST"
            />
          </div>

          {/* Status Endpoint */}
          <div className="bg-background/50 border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-highlight" />
              Agent Status
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check your agent's status and configuration
            </p>
            <APISnippet
              endpoint="api.ragflow.com/v1/agent/abc123"
              method="GET"
            />
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-highlight/10 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-highlight" />
            </div>
            <h4 className="font-semibold mb-2">RESTful API</h4>
            <p className="text-sm text-muted-foreground">
              Standard HTTP endpoints that work with any language or framework
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-highlight/10 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-highlight" />
            </div>
            <h4 className="font-semibold mb-2">Secure by Default</h4>
            <p className="text-sm text-muted-foreground">
              API keys, rate limiting, and tenant isolation built-in
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-highlight/10 flex items-center justify-center mx-auto mb-3">
              <Code2 className="w-6 h-6 text-highlight" />
            </div>
            <h4 className="font-semibold mb-2">Streaming Support</h4>
            <p className="text-sm text-muted-foreground">
              Real-time streaming responses for better UX
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="https://docs.ragflow.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            <Code2 className="w-4 h-4" />
            View Full API Documentation
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default APIDemoSection;

