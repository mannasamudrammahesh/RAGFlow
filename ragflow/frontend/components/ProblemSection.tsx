import { X, Clock, DollarSign, EyeOff, ArrowRight, TrendingDown } from "lucide-react";

const ProblemSection = () => {
  const problems = [
    {
      icon: Clock,
      title: "Weeks to Build",
      stat: "6-8 weeks",
      description: "Average time to build a custom RAG pipeline from scratch",
      visual: "timeline",
    },
    {
      icon: DollarSign,
      title: "Costs Explode",
      stat: "10x",
      description: "Infrastructure costs when scaling from prototype to production",
      visual: "chart",
    },
    {
      icon: EyeOff,
      title: "Hidden Controls",
      stat: "80%",
      description: "Of critical settings locked behind vendor abstractions",
      visual: "lock",
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden bg-background">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-8 animate-fade-in">
            <X className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">The Industry Problem</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 animate-fade-in-up">
            <span className="text-foreground">Most RAG Systems</span>
            <br />
            <span className="text-muted-foreground">Never Reach Production</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Teams spend months building, only to hit walls when it's time to ship.
          </p>
        </div>
        
        {/* Story-driven problem cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {problems.map((problem, index) => (
            <div 
              key={index} 
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-destructive/40 transition-all duration-500 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl group-hover:bg-destructive/10 transition-colors" />
              
              {/* Icon */}
              <div className="relative w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <problem.icon className="w-7 h-7 text-destructive" />
              </div>
              
              {/* Big stat */}
              <div className="relative mb-4">
                <span className="text-4xl md:text-5xl font-display font-bold text-destructive/90">
                  {problem.stat}
                </span>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {problem.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {problem.description}
              </p>
              
              {/* Visual indicator based on type */}
              <div className="mt-6 pt-4 border-t border-border">
                {problem.visual === "timeline" && (
                  <div className="flex items-center gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i} 
                        className="h-2 flex-1 rounded-full bg-destructive/20 group-hover:bg-destructive/40 transition-colors"
                        style={{ transitionDelay: `${i * 50}ms` }}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">weeks</span>
                  </div>
                )}
                {problem.visual === "chart" && (
                  <div className="flex items-end gap-1 h-8">
                    {[2, 3, 4, 6, 8, 10].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 rounded-t bg-destructive/20 group-hover:bg-destructive/40 transition-all"
                        style={{ 
                          height: `${h * 10}%`,
                          transitionDelay: `${i * 50}ms`
                        }}
                      />
                    ))}
                    <TrendingDown className="w-4 h-4 text-destructive ml-2 rotate-180" />
                  </div>
                )}
                {problem.visual === "lock" && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-4/5 bg-destructive/40 rounded-full group-hover:bg-destructive/60 transition-colors" />
                    </div>
                    <span className="text-xs text-destructive font-medium">locked</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* The journey visualization */}
        <div className="relative py-12 mb-16">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Start */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl">💡</span>
              </div>
              <span className="text-sm text-muted-foreground">Idea</span>
            </div>
            
            {/* Arrow with problem */}
            <div className="flex-1 relative max-w-xs">
              <div className="h-0.5 bg-gradient-to-r from-secondary via-destructive/50 to-destructive" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">months of struggle</span>
              </div>
              <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 text-destructive" />
            </div>
            
            {/* Fail state */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border-2 border-dashed border-destructive/30 flex items-center justify-center mb-2 mx-auto">
                <X className="w-6 h-6 text-destructive/50" />
              </div>
              <span className="text-sm text-muted-foreground">Never Ships</span>
            </div>
          </div>
        </div>
        
        {/* Transition statement */}
        <div className="text-center">
          <div className="inline-block">
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Demos are easy. <span className="text-foreground font-medium">Production is hard.</span>
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-highlight to-transparent mb-8" />
            <p className="text-2xl md:text-3xl font-display font-semibold">
              <span className="text-highlight">RagFlow</span> is built for production.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
