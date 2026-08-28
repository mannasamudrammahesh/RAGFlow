import { Upload, Sliders, Bot, Rocket } from "lucide-react";

const HowItWorksGrid = () => {
  const steps = [
    {
      icon: Upload,
      title: "Connect Data",
      items: ["Upload", "Scrape", "Sync"],
      span: "default",
    },
    {
      icon: Sliders,
      title: "Configure Pipeline",
      items: ["Chunk size", "Overlap", "Embeddings", "Vector DB"],
      span: "default",
    },
    {
      icon: Bot,
      title: "Generate AI Agent",
      items: ["LangChain powered", "Context-aware", "Source-grounded"],
      span: "wide",
    },
    {
      icon: Rocket,
      title: "Deploy & Scale",
      items: ["One chatbot", "Or thousands"],
      span: "default",
    },
  ];

  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          How RagFlow Works
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          From data ingestion to deployment in four simple steps.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`bento-card ${step.span === "wide" ? "md:col-span-2" : ""}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <step.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
              <ul className="space-y-2">
                {step.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksGrid;
