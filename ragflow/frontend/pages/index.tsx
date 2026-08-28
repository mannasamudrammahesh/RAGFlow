import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BentoGridFeatures from "@/components/BentoGridFeatures";
import ProblemSection from "@/components/ProblemSection";
import AnimatedPipelineStory from "@/components/AnimatedPipelineStory";
import PhilosophySection from "@/components/PhilosophySection";
import PersonaGrid from "@/components/PersonaGrid";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <BentoGridFeatures />
        <ProblemSection />
        <AnimatedPipelineStory />
        <PhilosophySection />
        <PersonaGrid />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
