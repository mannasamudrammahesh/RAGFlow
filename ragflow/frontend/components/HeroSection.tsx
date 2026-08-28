import { Button } from "@/components/ui/button";

import { useRouter } from "next/router";
import { analytics } from "@/utils/analytics";

const HeroSection = () => {
  const router = useRouter();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          src="/chatbot-demo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Lighter overlay for better video visibility */}
        <div className="absolute inset-0 bg-background/40" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />
      </div>
      
      {/* Text Content - overlaid on video */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/20 bg-background/30 backdrop-blur-md mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-foreground/80">Now in Private Beta</span>
        </div>
        
        <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[1] mb-6 animate-fade-in-up text-foreground drop-shadow-lg">
          <span className="block">Build Your Production-Grade</span>
          <span className="block">RAG Chatbot</span>
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in-up animate-delay-100 drop-shadow-md">
          RagFlow is a RAG-as-a-Service platform for teams that need control, scale, and reliability — powered by your data.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up animate-delay-200">
          {/* Primary button - white bg, black text */}
          <button 
            onClick={() => {
              analytics.trackCTAClick('Get Started', 'hero_section');
              analytics.trackConversion('cta_click_get_started');
              router.push('/app');
            }}
            className="px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-all duration-200"
          >
            Get Started
          </button>
          {/* Secondary button - transparent with white border */}
          <button 
            onClick={() => {
              analytics.trackCTAClick('See Architecture', 'hero_section');
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-6 py-2.5 bg-transparent border border-foreground/40 text-foreground text-sm font-medium rounded-md hover:bg-foreground/10 hover:border-foreground/60 transition-all duration-200"
          >
            See Architecture
          </button>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />
    </section>
  );
};

export default HeroSection;
